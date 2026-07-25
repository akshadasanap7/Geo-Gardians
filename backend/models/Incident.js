const mongoose = require('mongoose');

const TimelineEntrySchema = new mongoose.Schema({
  status:    String,
  note:      String,
  actor:     String,
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const IncidentSchema = new mongoose.Schema({
  incidentId:       { type: String, unique: true },
  touristId:        { type: String, required: true, index: true },
  touristName:      String,
  type:             { type: String, enum: ['sos','auto-detected','geofence','inactivity'], default: 'sos' },
  status:           {
    type: String,
    enum: ['detected','alerted','acknowledged','responder-assigned','in-progress','resolved'],
    default: 'detected'
  },
  severity:         { type: String, enum: ['low','medium','high','critical'], default: 'high' },
  location: {
    latitude:  Number,
    longitude: Number,
    timestamp: Date
  },
  riskScore:        Number,
  riskLevel:        String,
  riskFactors:      [String],
  zoneInfo:         mongoose.Schema.Types.Mixed,
  assignedResponder: String,
  responderNotes:   String,
  message:          String,
  timeline:         [TimelineEntrySchema],
  synced:           { type: Boolean, default: true },
  syncStatus:       { type: String, enum: ['synced','pending','failed'], default: 'synced' },
  clientId:         String,
  resolvedAt:       Date
}, { timestamps: true });

IncidentSchema.pre('save', function (next) {
  if (!this.incidentId) {
    this.incidentId = `INC-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Incident', IncidentSchema);
