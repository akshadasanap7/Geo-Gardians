const router   = require('express').Router();
const Incident = require('../models/Incident');
const Tourist  = require('../models/Tourist');
const Geofence = require('../models/Geofence');
const { calculateRisk } = require('../services/riskEngine');
const { protect, authorize } = require('../middleware/auth');

// POST /api/incidents/sos — no auth required so offline/unauthenticated clients can still send SOS
router.post('/sos', async (req, res, next) => {
  try {
    const { touristId, latitude, longitude, weather, movementSpeed, inactivityMins, clientId, message } = req.body;

    if (clientId) {
      const dup = await Incident.findOne({ clientId });
      if (dup) return res.json({ duplicate: true, incident: dup });
    }

    const tourist = await Tourist.findOne({ touristId });
    if (!tourist) return res.status(404).json({ error: 'Tourist not found' });

    const zones = await Geofence.find({ isActive: true });
    const risk  = await calculateRisk({
      latitude: latitude || tourist.lastLocation?.latitude,
      longitude: longitude || tourist.lastLocation?.longitude,
      weather: weather || tourist.lastWeather || 'clear',
      movementSpeed: movementSpeed ?? tourist.lastMovementSpeed ?? 0,
      inactivityMins: inactivityMins ?? tourist.lastInactivityMins ?? 0,
      zones
    });

    const incident = await Incident.create({
      touristId, touristName: tourist.name,
      type: 'sos', severity: risk.score >= 80 ? 'critical' : 'high',
      location: { latitude, longitude, timestamp: new Date() },
      riskScore: risk.score, riskLevel: risk.level, riskFactors: risk.factors,
      zoneInfo: tourist.zoneInfo, clientId,
      message: message || 'SOS triggered. Emergency services notified.',
      synced: true, syncStatus: 'synced',
      timeline: [{ status: 'detected', note: 'SOS triggered by tourist', actor: tourist.name }]
    });

    tourist.status  = 'emergency';
    tourist.lastSOS = new Date();
    await tourist.save();

    if (req.io) req.io.emit('incident:sos', { incident, tourist: { touristId, name: tourist.name, location: tourist.lastLocation } });

    res.status(201).json({ incident });
  } catch (err) { next(err); }
});

// POST /api/incidents/alert-escalation — auto escalation when tourist doesn't respond
router.post('/alert-escalation', protect, async (req, res, next) => {
  try {
    const { touristId, riskLevel, riskFactors, message } = req.body;
    const tourist = await Tourist.findOne({ touristId });
    if (!tourist) return res.status(404).json({ error: 'Tourist not found' });

    // check no active incident already
    const existing = await Incident.findOne({ touristId, status: { $nin: ['resolved'] } });
    if (existing) return res.json({ incident: existing, duplicate: true });

    const incident = await Incident.create({
      touristId,
      touristName: tourist.name,
      type: 'auto-detected',
      severity: riskLevel === 'CRITICAL' ? 'critical' : 'high',
      location: tourist.lastLocation
        ? { latitude: tourist.lastLocation.latitude, longitude: tourist.lastLocation.longitude, timestamp: new Date() }
        : undefined,
      riskScore: tourist.latestRiskScore,
      riskLevel,
      riskFactors,
      zoneInfo: tourist.zoneInfo,
      message: message || `Tourist did not respond to HIGH RISK alert. Risk: ${riskLevel}.`,
      timeline: [
        { status: 'detected',  note: 'AI risk alert triggered', actor: 'system' },
        { status: 'alerted',   note: 'Tourist was notified but did not respond within 60s', actor: 'system' },
      ]
    });

    tourist.status = 'high-risk';
    await tourist.save();

    if (req.io) req.io.emit('incident:new', incident);
    res.status(201).json({ incident });
  } catch (err) { next(err); }
});

// GET /api/incidents
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.touristId) filter.touristId = req.query.touristId;
    const incidents = await Incident.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(incidents);
  } catch (err) { next(err); }
});

// PATCH /api/incidents/:id
router.patch('/:id', protect, authorize('admin','authority','responder'), async (req, res, next) => {
  try {
    const { status, assignedResponder, responderNotes } = req.body;
    const inc = await Incident.findOne({ incidentId: req.params.id });
    if (!inc) return res.status(404).json({ error: 'Incident not found' });

    if (status) {
      inc.status = status;
      inc.timeline.push({ status, note: responderNotes || '', actor: req.user.name });
      if (status === 'resolved') inc.resolvedAt = new Date();
    }
    if (assignedResponder) {
      inc.assignedResponder = assignedResponder;
      inc.timeline.push({ status: 'responder-assigned', note: `Assigned to ${assignedResponder}`, actor: req.user.name });
    }
    if (responderNotes) inc.responderNotes = responderNotes;

    await inc.save();
    if (req.io) req.io.emit('incident:updated', inc);
    res.json(inc);
  } catch (err) { next(err); }
});

// POST /api/incidents/bulk — no auth required for offline batch sync
router.post('/bulk', async (req, res, next) => {
  try {
    const { records } = req.body;
    const results = { synced: 0, duplicates: 0, failed: 0 };
    for (const r of records) {
      try {
        if (r.clientId) {
          const dup = await Incident.findOne({ clientId: r.clientId });
          if (dup) { results.duplicates++; continue; }
        }
        const inc = await Incident.create({ ...r, synced: true, syncStatus: 'synced' });
        if (req.io) req.io.emit('incident:new', inc);
        results.synced++;
      } catch { results.failed++; }
    }
    res.json(results);
  } catch (err) { next(err); }
});

module.exports = router;
