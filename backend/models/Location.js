const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  touristId:    { type: String, required: true, index: true },
  latitude:     { type: Number, required: true },
  longitude:    { type: Number, required: true },
  accuracy:     Number,
  altitude:     Number,
  speed:        Number,
  heading:      Number,
  timestamp:    { type: Date, default: Date.now },
  synced:       { type: Boolean, default: true },
  syncStatus:   { type: String, enum: ['synced','pending','failed'], default: 'synced' },
  retryCount:   { type: Number, default: 0 },
  clientId:     String,   // offline-generated UUID to prevent duplicates
  zoneId:       String,
  zoneType:     String,
  riskLevel:    String
}, { timestamps: true });

LocationSchema.index({ touristId: 1, timestamp: -1 });
LocationSchema.index({ clientId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Location', LocationSchema);
