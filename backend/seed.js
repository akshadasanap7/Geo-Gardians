require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Geofence = require('./models/Geofence');

const ZONES = [
  { name: 'Hotel Zone',        type: 'safe',       latitude: 20.0059, longitude: 73.7897, radius: 0.04, description: 'Tourist hotel area', instructions: 'You are in a safe zone.' },
  { name: 'Crowded Market',    type: 'caution',    latitude: 20.0082, longitude: 73.7950, radius: 0.03, description: 'High foot traffic area', instructions: 'Stay alert and keep valuables secure.' },
  { name: 'Landslide Prone',   type: 'danger',     latitude: 20.0105, longitude: 73.8010, radius: 0.025, description: 'Landslide risk zone', instructions: 'Move to safety immediately.' },
  { name: 'Flood Zone',        type: 'danger',     latitude: 20.0130, longitude: 73.7960, radius: 0.02, description: 'Flood-prone low-lying area', instructions: 'Evacuate immediately during rain.' },
  { name: 'Military Boundary', type: 'restricted', latitude: 20.0150, longitude: 73.8050, radius: 0.015, description: 'Restricted military area', instructions: 'Entry strictly prohibited.' }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/safeyatra');

  // admin user
  const existing = await User.findOne({ email: 'admin@safeyatra.ai' });
  if (!existing) {
    await User.create({ name: 'SafeYatra Admin', email: 'admin@safeyatra.ai', password: 'Admin@1234', role: 'admin' });
    console.log('✅ Admin user created: admin@safeyatra.ai / Admin@1234');
  }

  // authority user
  const auth = await User.findOne({ email: 'authority@safeyatra.ai' });
  if (!auth) {
    await User.create({ name: 'District Authority', email: 'authority@safeyatra.ai', password: 'Auth@1234', role: 'authority' });
    console.log('✅ Authority user created: authority@safeyatra.ai / Auth@1234');
  }

  // zones
  await Geofence.deleteMany({});
  await Geofence.insertMany(ZONES);
  console.log(`✅ ${ZONES.length} geofence zones seeded`);

  await mongoose.disconnect();
  console.log('✅ Seed complete');
}

seed().catch((err) => { console.error(err); process.exit(1); });
