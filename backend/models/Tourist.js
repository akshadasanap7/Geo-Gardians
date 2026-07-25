const mongoose = require('mongoose');
const crypto = require('crypto');

const TouristSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  touristId:        { type: String, unique: true },          // SY-2026-XXXXXX
  name:             { type: String, required: true },
  age:              { type: Number },
  phone:            { type: String, select: false },          // sensitive — hidden by default
  emergencyContact: { type: String, select: false },          // sensitive
  medicalInfo:      { type: String, select: false },          // sensitive
  destination:      { type: String, required: true },
  language:         { type: String, default: 'en' },
  digitalId:        { type: String },                         // SHA-256 hash (public)
  qrCode:           { type: String },                         // short code for QR
  status:           { type: String, enum: ['safe','monitoring','high-risk','emergency','offline'], default: 'safe' },
  isJourneyActive:  { type: Boolean, default: false },
  lastLocation: {
    latitude:  Number,
    longitude: Number,
    timestamp: Date,
    accuracy:  Number
  },
  latestRiskScore:   { type: Number, default: 0 },
  latestRiskLevel:   { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'LOW' },
  latestRiskFactors: [String],
  zoneInfo: {
    zoneName: String,
    zoneType: String,
    zoneAlert: String
  },
  lastWeather:         String,
  lastMovementSpeed:   Number,
  lastInactivityMins:  Number,
  lastSOS:             Date,
  isOnline:            { type: Boolean, default: true },
  lastSeenAt:          Date,
  syncedAt:            Date
}, { timestamps: true });

TouristSchema.pre('save', function (next) {
  if (!this.touristId) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.touristId = `SY-${new Date().getFullYear()}-${suffix}`;
  }
  if (!this.digitalId) {
    this.digitalId = crypto
      .createHash('sha256')
      .update(`${this.name}:${this.phone || ''}:${this.destination}:${Date.now()}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();
  }
  if (!this.qrCode) {
    this.qrCode = `SY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Tourist', TouristSchema);
