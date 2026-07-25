const router   = require('express').Router();
const Location = require('../models/Location');
const Tourist  = require('../models/Tourist');
const Geofence = require('../models/Geofence');
const Incident = require('../models/Incident');
const { calculateRisk } = require('../services/riskEngine');
const { protect } = require('../middleware/auth');

// POST /api/locations — single location update
router.post('/', protect, async (req, res, next) => {
  try {
    const { touristId, latitude, longitude, accuracy, speed, heading, weather, inactivityMins, clientId } = req.body;

    // dedup by clientId
    if (clientId) {
      const dup = await Location.findOne({ clientId });
      if (dup) return res.json({ duplicate: true, location: dup });
    }

    const zones = await Geofence.find({ isActive: true });
    const risk  = await calculateRisk({ latitude, longitude, weather: weather || 'clear', movementSpeed: speed || 0, inactivityMins: inactivityMins || 0, zones });

    const loc = await Location.create({
      touristId, latitude, longitude, accuracy, speed, heading,
      clientId, synced: true, syncStatus: 'synced',
      zoneId: risk.zone?._id, zoneType: risk.zone?.type, riskLevel: risk.level
    });

    // update tourist record
    const tourist = await Tourist.findOneAndUpdate(
      { touristId },
      {
        lastLocation: { latitude, longitude, timestamp: new Date(), accuracy },
        latestRiskScore: risk.score,
        latestRiskLevel: risk.level,
        latestRiskFactors: risk.factors,
        lastWeather: weather,
        lastMovementSpeed: speed,
        lastInactivityMins: inactivityMins,
        status: risk.level === 'CRITICAL' ? 'high-risk' : risk.level === 'HIGH' ? 'monitoring' : 'safe',
        zoneInfo: risk.zone ? {
          zoneName: risk.zone.name,
          zoneType: risk.zone.type,
          zoneAlert: buildAlert(risk.zone)
        } : { zoneName: 'Open Area', zoneType: 'safe', zoneAlert: 'You are in a safe area.' },
        lastSeenAt: new Date()
      },
      { new: true }
    );

    // auto-create incident if CRITICAL and no active incident
    if (risk.level === 'CRITICAL') {
      const active = await Incident.findOne({ touristId, status: { $nin: ['resolved'] } });
      if (!active) {
        const inc = await Incident.create({
          touristId, touristName: tourist?.name,
          type: 'auto-detected', severity: 'critical',
          location: { latitude, longitude, timestamp: new Date() },
          riskScore: risk.score, riskLevel: risk.level, riskFactors: risk.factors,
          zoneInfo: tourist?.zoneInfo,
          message: 'AI detected a possible emergency situation.',
          timeline: [{ status: 'detected', note: 'Auto-detected by AI risk engine', actor: 'system' }]
        });
        if (req.io) req.io.emit('incident:new', inc);
      }
    }

    if (req.io) req.io.emit('location:update', { touristId, latitude, longitude, riskLevel: risk.level, riskScore: risk.score });

    res.status(201).json({ location: loc, risk });
  } catch (err) { next(err); }
});

// POST /api/locations/bulk — offline batch sync
router.post('/bulk', protect, async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: 'records must be an array' });
    const results = { synced: 0, duplicates: 0, failed: 0 };
    for (const r of records) {
      try {
        if (r.clientId) {
          const dup = await Location.findOne({ clientId: r.clientId });
          if (dup) { results.duplicates++; continue; }
        }
        await Location.create({ ...r, synced: true, syncStatus: 'synced' });
        results.synced++;
      } catch { results.failed++; }
    }
    res.json(results);
  } catch (err) { next(err); }
});

// GET /api/locations/:touristId — location history
router.get('/:touristId', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const locs  = await Location.find({ touristId: req.params.touristId }).sort({ timestamp: -1 }).limit(limit);
    res.json(locs);
  } catch (err) { next(err); }
});

function buildAlert(zone) {
  if (zone.type === 'danger')     return `⚠️ DANGER ZONE: ${zone.name}. ${zone.instructions || 'Move to safety immediately.'}`;
  if (zone.type === 'restricted') return `🚫 RESTRICTED ZONE: ${zone.name}. ${zone.instructions || 'You must leave this area.'}`;
  if (zone.type === 'caution')    return `⚠️ CAUTION ZONE: ${zone.name}. ${zone.instructions || 'Stay alert.'}`;
  return `✅ SAFE ZONE: ${zone.name}.`;
}

module.exports = router;
