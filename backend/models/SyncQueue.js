const mongoose = require('mongoose');

const SyncQueueSchema = new mongoose.Schema({
  clientId:    { type: String, required: true, unique: true },
  type:        { type: String, enum: ['location','incident','tourist','risk'], required: true },
  payload:     mongoose.Schema.Types.Mixed,
  status:      { type: String, enum: ['pending','processing','synced','failed'], default: 'pending' },
  retryCount:  { type: Number, default: 0 },
  maxRetries:  { type: Number, default: 5 },
  error:       String,
  syncedAt:    Date
}, { timestamps: true });

module.exports = mongoose.model('SyncQueue', SyncQueueSchema);
