const router   = require('express').Router();
const Geofence = require('../models/Geofence');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const zones = await Geofence.find({ isActive: true });
    res.json(zones);
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin','authority'), async (req, res, next) => {
  try {
    const zone = await Geofence.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(zone);
  } catch (err) { next(err); }
});

router.patch('/:id', protect, authorize('admin','authority'), async (req, res, next) => {
  try {
    const zone = await Geofence.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    res.json(zone);
  } catch (err) { next(err); }
});

router.delete('/:id', protect, authorize('admin','authority'), async (req, res, next) => {
  try {
    await Geofence.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
