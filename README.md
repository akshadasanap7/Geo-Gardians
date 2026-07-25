# SafeYatra AI

Smart Tourist Safety Monitoring & Incident Response System.

## What it includes

- Tourist registration with generated digital ID and QR-style code
- Location updates with live risk scoring and geo-fence alerts
- SOS incident creation and emergency response tracking
- Admin-style dashboard metrics and incident resolution
- Simulated digital ID verification endpoint
- JSON-backed persistence for easy local use

## Run locally

1. Open a terminal in the project folder.
2. Run `node server.js`.
3. Open `http://localhost:3000` in a browser.

> No external npm dependencies are required for this prototype.

## Endpoints

- `GET /api/health` - backend health check
- `GET /api/tourists` - list all tourists
- `POST /api/tourists` - register a new tourist
- `POST /api/tourists/:id/location` - update a tourist location and risk score
- `POST /api/sos` - trigger SOS incident for a tourist
- `GET /api/zones` - get predefined geo-fence zones
- `GET /api/incidents` - get incident records
- `POST /api/verify` - verify a digital ID hash / QR code
- `GET /api/dashboard` - dashboard summary

## Demo flow

1. Register a tourist using the form.
2. Simulate a risk route to move the tourist into caution and danger zones.
3. Trigger SOS to create an incident.
4. Verify the digital ID and inspect the live dashboard.

## Notes

This prototype uses a simple Node.js server with local JSON data storage. It is designed as a hackathon MVP and can be extended with real databases, real maps, authentication, and blockchain-backed identity verification.
