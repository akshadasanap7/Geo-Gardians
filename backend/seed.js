require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Geofence = require('./models/Geofence');

const USERS = [
  { name: 'Admin User',      email: 'admin@safeyatra.com',   password: 'admin123', role: 'admin' },
  { name: 'Authority User',  email: 'auth@safeyatra.com',    password: 'auth123',  role: 'authority' },
  { name: 'Responder User',  email: 'resp@safeyatra.com',    password: 'resp123',  role: 'responder' },
  { name: 'Demo Tourist',    email: 'tourist@safeyatra.com', password: 'tour123',  role: 'tourist' },
];

const ZONES = [
  { name: 'Hotel Zone',       type: 'safe',       latitude: 20.0059, longitude: 73.7897, radius: 0.04, isActive: true, instructions: 'Safe accommodation area.' },
  { name: 'Crowded Market',   type: 'caution',    latitude: 20.0082, longitude: 73.7950, radius: 0.03, isActive: true, instructions: 'Stay alert. Pickpocket risk.' },
  { name: 'Landslide Prone',  type: 'danger',     latitude: 20.0105, longitude: 73.8010, radius: 0.025, isActive: true, instructions: 'Move to safety immediately.' },
  { name: 'Forest Reserve',   type: 'restricted', latitude: 20.0120, longitude: 73.7870, radius: 0.02, isActive: true, instructions: 'Entry not permitted.' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`✅ Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`⏭  User exists: ${u.email}`);
    }
  }

  const zoneCount = await Geofence.countDocuments();
  if (zoneCount === 0) {
    await Geofence.insertMany(ZONES);
    console.log(`✅ Seeded ${ZONES.length} geo-fence zones`);
  } else {
    console.log(`⏭  Zones already exist (${zoneCount})`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
