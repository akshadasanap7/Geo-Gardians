const mongoose = require('mongoose');

const GeofenceSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  type:         { type: String, enum: ['safe','caution','danger','restricted'], required: true },
  latitude:     { type: Number, required: true },
  longitude:    { type: Number, required: true },
  radius:       { type: Number, required: true },   // km
  description:  String,
  instructions: String,
  riskScore:    { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Geofence', GeofenceSchema);
