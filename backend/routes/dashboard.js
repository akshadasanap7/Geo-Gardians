const router   = require('express').Router();
const Tourist  = require('../models/Tourist');
const Incident = require('../models/Incident');
const Location = require('../models/Location');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin','authority','responder'), async (req, res, next) => {
  try {
    const [tourists, incidents] = await Promise.all([
      Tourist.find(),
      Incident.find().sort({ createdAt: -1 }).limit(20)
    ]);

    const activeEmergencies = incidents.filter((i) => i.status !== 'resolved').length;
    const highRiskCount      = tourists.filter((t) => t.latestRiskLevel === 'HIGH').length;

    const stats = {
      activeTourists:    tourists.length,
      activeEmergencies,
      criticalRisk:      tourists.filter((t) => t.latestRiskLevel === 'CRITICAL').length,
      highRisk:          highRiskCount,
      highRiskTourists:  highRiskCount,   // alias used by AdminDashboard.jsx
      safeTourists:      tourists.filter((t) => t.status === 'safe').length,
      offlineTourists:   tourists.filter((t) => t.status === 'offline').length,
      weatherAffected:   tourists.filter((t) => ['storm','flood','landslide'].includes(t.lastWeather)).length,
      recentIncidents:   incidents.slice(0, 10),
      touristLocations:  tourists.map((t) => ({
        touristId:    t.touristId,
        name:         t.name,
        status:       t.status,
        riskLevel:    t.latestRiskLevel,
        riskScore:    t.latestRiskScore,
        location:     t.lastLocation,
        zoneInfo:     t.zoneInfo,
        isOnline:     t.isOnline,
        lastSeenAt:   t.lastSeenAt
      }))
    };
    res.json(stats);
  } catch (err) { next(err); }
});

module.exports = router;
