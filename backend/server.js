require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { processSyncQueue } = require('./services/syncService');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET','POST','PATCH','DELETE'] }
});

// ── middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));

// attach io to every request
app.use((req, _res, next) => { req.io = io; next(); });

// ── routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/tourists',   require('./routes/tourists'));
app.use('/api/locations',  require('./routes/locations'));
app.use('/api/incidents',  require('./routes/incidents'));
app.use('/api/geofences',  require('./routes/geofences'));
app.use('/api/zones',      require('./routes/geofences'));  // alias for frontend /zones calls
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/verify',     require('./routes/verify'));
app.use('/api/sync',       require('./routes/sync'));
app.get('/api/health',     (_req, res) => res.json({ ok: true, service: 'SafeYatra AI Backend', ts: new Date() }));

app.use(errorHandler);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('join:dashboard', () => socket.join('dashboard'));
  socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

// ── background sync processor (every 30s) ────────────────────────────────────
setInterval(() => processSyncQueue(io), 30000);

// ── start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`🚀 SafeYatra backend running on http://localhost:${PORT}`));
});

module.exports = { app, server };
