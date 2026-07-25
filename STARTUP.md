# SafeYatra AI — Full Stack Startup Guide

## Architecture
- **Prototype** (Node.js, no DB) → `localhost:3000`
- **Backend** (Node.js + MongoDB + Socket.IO) → `localhost:5000`
- **Frontend** (React + Vite) → `localhost:5173`
- **AI Service** (FastAPI + ML) → `localhost:8000`

---

## Option A — Quick Demo (Prototype only, no MongoDB needed)

```bash
# From project root
node server.js
# Open http://localhost:3000
```

---

## Option B — Full Stack (for competition)

### 1. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```

### 2. Backend
```bash
cd backend
npm install
node seed.js        # creates demo users + zones
npm run dev         # starts on http://localhost:5000
```

### 3. AI Service
```bash
cd ai-service
pip install -r requirements.txt
python train_model.py          # generates model.pkl (run once)
uvicorn main:app --reload --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

---

## Demo Login Credentials

| Role       | Email                      | Password  |
|------------|----------------------------|-----------|
| Admin      | admin@safeyatra.com        | admin123  |
| Authority  | auth@safeyatra.com         | auth123   |
| Responder  | resp@safeyatra.com         | resp123   |
| Tourist    | tourist@safeyatra.com      | tour123   |

---

## Demo Flow (Full Stack)

1. Login as **Tourist** → Register profile → Start location tracking → Trigger SOS
2. Login as **Authority** → Watch live map update → Assign responder to incident
3. Login as **Responder** → Acknowledge → Mark in-progress → Resolve
4. Login as **Admin** → View full system stats, manage zones

---

## Key Features

- Real-time location tracking with GPS
- AI risk scoring (ML model + rule-based fallback)
- Geo-fence zones (safe / caution / danger / restricted)
- SOS with hold-to-trigger (offline queued)
- Digital ID with QR code + cryptographic hash verification
- Socket.IO live updates across all dashboards
- Offline-first with IndexedDB sync queue
- Role-based access (tourist / authority / responder / admin)
- Weather risk integration
- Auto-incident creation on CRITICAL risk detection
