const SyncQueue = require('../models/SyncQueue');
const Location  = require('../models/Location');
const Incident  = require('../models/Incident');
const Tourist   = require('../models/Tourist');

async function processSyncQueue(io) {
  const pending = await SyncQueue.find({ status: 'pending', retryCount: { $lt: 5 } }).limit(50);
  for (const item of pending) {
    try {
      item.status = 'processing';
      await item.save();

      if (item.type === 'location') {
        const exists = await Location.findOne({ clientId: item.clientId });
        if (!exists) await Location.create({ ...item.payload, clientId: item.clientId, synced: true, syncStatus: 'synced' });
      } else if (item.type === 'incident') {
        const exists = await Incident.findOne({ clientId: item.clientId });
        if (!exists) {
          const inc = await Incident.create({ ...item.payload, clientId: item.clientId, synced: true, syncStatus: 'synced' });
          if (io) io.emit('incident:new', inc);
        }
      } else if (item.type === 'tourist') {
        await Tourist.findOneAndUpdate({ touristId: item.payload.touristId }, item.payload, { upsert: true });
      }

      item.status  = 'synced';
      item.syncedAt = new Date();
      await item.save();
    } catch (err) {
      item.retryCount += 1;
      item.status = item.retryCount >= 5 ? 'failed' : 'pending';
      item.error  = err.message;
      await item.save();
    }
  }
}

module.exports = { processSyncQueue };
