const router  = require('express').Router();
const Tourist = require('../models/Tourist');
const { protect, authorize } = require('../middleware/auth');

// POST /api/tourists — register tourist profile (one per user)
router.post('/', protect, async (req, res, next) => {
  try {
    const existing = await Tourist.findOne({ userId: req.user._id });
    if (existing) return res.status(409).json({ error: 'Tourist profile already exists for this account' });
    const { name, age, phone, emergencyContact, medicalInfo, destination, language } = req.body;
    if (!name || !destination) return res.status(400).json({ error: 'Name and destination are required' });
    const tourist = await Tourist.create({
      userId: req.user._id,
      name, age, phone, emergencyContact, medicalInfo, destination,
      language: language || 'en'
    });
    res.status(201).json(sanitize(tourist));
  } catch (err) { next(err); }
});

// GET /api/tourists — admin/authority: all; tourist: own
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = ['admin','authority','responder'].includes(req.user.role)
      ? {}
      : { userId: req.user._id };
    const tourists = await Tourist.find(filter).sort({ updatedAt: -1 });
    res.json(tourists.map(sanitize));
  } catch (err) { next(err); }
});

// GET /api/tourists/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const t = await Tourist.findOne({ touristId: req.params.id });
    if (!t) return res.status(404).json({ error: 'Tourist not found' });
    res.json(sanitize(t));
  } catch (err) { next(err); }
});

// PATCH /api/tourists/:id/journey
router.patch('/:id/journey', protect, async (req, res, next) => {
  try {
    const { action } = req.body; // start | pause | stop
    const t = await Tourist.findOne({ touristId: req.params.id });
    if (!t) return res.status(404).json({ error: 'Tourist not found' });
    t.isJourneyActive = action === 'start';
    await t.save();
    res.json({ isJourneyActive: t.isJourneyActive });
  } catch (err) { next(err); }
});

function sanitize(t) {
  const obj = t.toObject ? t.toObject() : t;
  delete obj.phone;
  delete obj.emergencyContact;
  delete obj.medicalInfo;
  return obj;
}

module.exports = router;
