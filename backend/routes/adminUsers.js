const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const User   = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const adminOnly = [protect, authorize('admin')];

// GET /api/admin/users — list all users
router.get('/users', ...adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

// POST /api/admin/users — create authority or responder account
router.post('/users', ...adminOnly, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['authority', 'responder']).withMessage('Role must be authority or responder')
], validate, async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, phone: phone || '', password, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (err) { next(err); }
});

// PATCH /api/admin/users/:id/toggle — enable or disable account
router.patch('/users/:id/toggle', ...adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot disable admin account' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ id: user._id, isActive: user.isActive });
  } catch (err) { next(err); }
});

// PATCH /api/admin/users/:id/reset-password — reset password
router.patch('/users/:id/reset-password', ...adminOnly, [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = req.body.password;
    await user.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', ...adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin account' });
    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
