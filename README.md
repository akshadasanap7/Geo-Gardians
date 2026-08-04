# SafeYatra AI

**Smart Tourist Safety Monitoring & Incident Response System**

A full-stack, production-ready platform that protects tourists using real-time GPS tracking, AI-powered risk scoring, geo-fence alerts, offline-first SOS escalation, and role-based dashboards for tourists, authorities, responders, and admins.

---

## Architecture

```
Frontend (React + Vite)     →  http://localhost:5173
Backend  (Node.js + Express) →  http://localhost:5000
AI Service (FastAPI + ML)   →  http://localhost:8000
Database (MongoDB)          →  mongodb://localhost:27017/safeyatra
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Socket.IO client |
| Backend | Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcrypt |
| AI Service | Python, FastAPI, scikit-learn (Gradient Boosting) |
| Maps | Leaflet + React Leaflet |
| Offline | IndexedDB (idb), Service Worker (Vite PWA) |
| Blockchain | Solidity (TouristIdentity.sol) — identity hash registry |
| Deployment | Netlify (frontend), Render (backend + AI), MongoDB Atlas |

---

## Features

- **Role-based authentication** — Tourist self-registration, Authority/Responder/Admin accounts created by Admin only
- **Real-time GPS tracking** — Location updates with live risk scoring and geo-fence detection
- **AI risk engine** — ML model (Gradient Boosting) with rule-based fallback, scores 0–100 across zone, weather, inactivity, and time factors
- **Geo-fence zones** — Safe, Caution, Danger, Restricted zones with auto-alerts on entry
- **SOS escalation chain** — Internet → SMS fallback → Bluetooth mesh → Local IndexedDB → auto-sync on reconnect
- **60-second alert flow** — Tourist has 60s to respond "I'm Safe" before auto-escalation to authority
- **Digital ID** — QR-style cryptographic hash, blockchain-ready identity verification
- **Offline-first** — All core features (risk scoring, SOS, geo-fence) work without network
- **Socket.IO live updates** — Incidents and location changes push to all connected dashboards instantly
- **Admin user management** — Create, disable, delete Authority and Responder accounts

---

## User Roles

| Role | Access | Registration |
|---|---|---|
| Tourist | Personal dashboard, journey, safety monitor, SOS, digital ID | Public self-registration |
| Authority | Live map, incidents, tourists, geo-fences, analytics | Admin only |
| Responder | Dispatch, incident management, navigation | Admin only |
| Admin | Full platform control, user management, zones, audit logs | Seeded via `seed.js` |

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB (local) or MongoDB Atlas URI

### 1 — Install MongoDB

Download from https://www.mongodb.com/try/download/community and start the service, or use MongoDB Atlas.

### 2 — Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 3 — Configure environment

`backend/.env` is pre-configured for local development:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/safeyatra
JWT_SECRET=safeyatra_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4 — Seed the database (run once)

```bash
cd backend
node seed.js
```

Creates the default Admin, Authority, and Responder accounts plus geo-fence zones.

### 5 — Train the AI model (run once)

```bash
cd ai-service
python train_model.py
```

Generates `model.pkl` using synthetic training data.

### 6 — Start all services (4 terminals)

```bash
# Terminal 1 — MongoDB (skip if using Atlas)
mongod

# Terminal 2 — AI Service
cd ai-service
uvicorn main:app --reload --port 8000

# Terminal 3 — Backend
cd backend
npm run dev

# Terminal 4 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@safeyatra.com | admin123 |
| Authority | auth@safeyatra.com | auth123 |
| Responder | resp@safeyatra.com | resp123 |
| Tourist | Register at `/register` | — |

> Tourists register themselves. Authority and Responder accounts are created by Admin from the Users panel.

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Tourist self-registration |
| POST | `/api/auth/login` | Public | Login for all roles |
| GET | `/api/auth/me` | Protected | Current user profile |

### Tourists
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tourists` | Protected | List tourists |
| POST | `/api/tourists` | Tourist | Create tourist profile |
| GET | `/api/tourists/:id` | Protected | Get tourist by ID |
| PATCH | `/api/tourists/:id/journey` | Tourist | Start / pause journey |

### Locations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/locations` | Tourist | Submit location update + risk score |
| POST | `/api/locations/bulk` | Tourist | Offline batch sync |
| GET | `/api/locations/:touristId` | Protected | Location history |

### Incidents
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/incidents/sos` | Tourist | Trigger SOS |
| POST | `/api/incidents/alert-escalation` | Tourist | Auto-escalate after no response |
| GET | `/api/incidents` | Protected | List incidents |
| PATCH | `/api/incidents/:id` | Authority/Responder/Admin | Update incident status |
| POST | `/api/incidents/bulk` | Tourist | Offline batch sync |

### Geo-fences / Zones
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/geofences` | Public | List active zones |
| GET | `/api/zones` | Public | Alias for `/geofences` |
| POST | `/api/geofences` | Authority/Admin | Create zone |
| PATCH | `/api/geofences/:id` | Authority/Admin | Update zone |
| DELETE | `/api/geofences/:id` | Authority/Admin | Deactivate zone |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | List all users |
| POST | `/api/admin/users` | Admin | Create Authority or Responder account |
| PATCH | `/api/admin/users/:id/toggle` | Admin | Enable / disable account |
| PATCH | `/api/admin/users/:id/reset-password` | Admin | Reset password |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |

### Other
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Authority/Admin/Responder | Aggregated platform stats |
| POST | `/api/verify` | Public | Verify digital ID hash |
| GET | `/api/health` | Public | Backend health check |

---

## Demo Flow

1. **Register** as a new tourist at `/register`
2. Go to **Tourist Dashboard** → start journey → simulate GPS movement
3. Go to **Safety Monitor** → simulate danger zone entry → watch risk score climb
4. Wait for the **60-second HIGH RISK alert** → choose "I'm Safe" or let it escalate
5. Trigger **SOS** → watch the escalation chain (Internet → SMS → Local)
6. Switch to **Authority** → see the incident appear live via Socket.IO
7. Assign a responder → switch to **Responder** → acknowledge → resolve
8. Switch to **Admin** → create a new Authority account → manage users
9. Toggle **network offline** → trigger SOS → restore network → watch auto-sync
10. Open **Digital ID** → verify the cryptographic hash

---

## Project Structure

```
safeyatra/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── middleware/      # JWT auth, error handler
│   ├── models/          # User, Tourist, Incident, Location, Geofence, SyncQueue
│   ├── routes/          # auth, tourists, locations, incidents, geofences, dashboard, adminUsers, verify, sync
│   ├── services/        # riskEngine, syncService
│   ├── seed.js          # Database seeder
│   └── server.js        # Express + Socket.IO entry point
├── frontend/
│   └── src/
│       ├── components/  # shared, tourist, authority, responder, admin UI components
│       ├── pages/       # TouristPages, AuthorityPages, ResponderPages, AdminPages, LoginPage
│       ├── services/    # api, authService, sosEscalation, alertFlow, riskService, syncService
│       ├── store/       # AppContext (global state + actions)
│       ├── data/        # Mock data for offline/demo mode
│       └── main.jsx     # Router + role-based route guards
├── ai-service/
│   ├── main.py          # FastAPI risk prediction endpoint
│   └── train_model.py   # Gradient Boosting model trainer
├── blockchain/
│   └── contracts/       # TouristIdentity.sol — on-chain identity hash registry
└── data/                # JSON fallback data (prototype mode)
```

---

## Deployment

### Frontend → Netlify

```bash
cd frontend
npm run build
# Deploy the dist/ folder to Netlify
# Or connect GitHub repo — netlify.toml is pre-configured
```

Update `netlify.toml`:
```toml
[build]
  base    = "frontend"
  command = "npm run build"
  publish = "frontend/dist"
```

### Backend → Render

- New Web Service → root directory: `backend` → start command: `node server.js`
- Add all variables from `backend/.env`
- Replace `MONGO_URI` with your MongoDB Atlas connection string

### AI Service → Render

- New Web Service → root directory: `ai-service` → start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Update `AI_SERVICE_URL` in backend env vars to the Render URL

### Database → MongoDB Atlas

- Free M0 cluster at https://cloud.mongodb.com
- Whitelist `0.0.0.0/0` for Render IPs
- Run `node seed.js` once with the Atlas URI to seed initial data

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT with configurable expiry (default 7 days)
- Role-based middleware on every protected route
- Tourist self-registration only — Authority/Responder/Admin accounts are admin-provisioned
- Disabled accounts receive 403 on login
- Password hashes never returned in API responses
- Rate limiting on all API routes (500 req / 15 min)

---

## Known Limitations / Roadmap

- GPS uses browser `navigator.geolocation` — simulation buttons available for demo
- SMS fallback is simulated (integrate Twilio/MSG91 for production)
- Weather is manually selected (integrate OpenWeatherMap API)
- Blockchain identity registration is contract-ready but not yet wired to backend
- Tourist profile must be created manually after signup (auto-creation on first login planned)
- PWA icons (`icon-192.png`, `icon-512.png`) need to be added to `frontend/public/`
