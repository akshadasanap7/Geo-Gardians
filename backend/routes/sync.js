const router   = require('express').Router();
const SyncQueue = require('../models/SyncQueue');
const { processSyncQueue } = require('../services/syncService');
const { protect } = require('../middleware/auth');

// POST /api/sync — receive offline queue from client
router.post('/', protect, async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: 'records must be array' });

    let queued = 0, duplicates = 0;
    for (const r of records) {
      if (!r.clientId) continue;
      const exists = await SyncQueue.findOne({ clientId: r.clientId });
      if (exists) { duplicates++; continue; }
      await SyncQueue.create({ clientId: r.clientId, type: r.type, payload: r.payload, status: 'pending' });
      queued++;
    }

    // process immediately
    await processSyncQueue(req.io);

    res.json({ queued, duplicates, message: 'Sync initiated' });
  } catch (err) { next(err); }
});

// GET /api/sync/status
router.get('/status', protect, async (req, res, next) => {
  try {
    const [pending, failed, synced] = await Promise.all([
      SyncQueue.countDocuments({ status: 'pending' }),
      SyncQueue.countDocuments({ status: 'failed' }),
      SyncQueue.countDocuments({ status: 'synced' })
    ]);
    res.json({ pending, failed, synced });
  } catch (err) { next(err); }
});

module.exports = router;
