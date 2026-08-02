import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ZONE_COLORS = { safe: '#10b981', caution: '#f59e0b', danger: '#ef4444', restricted: '#6b7280' };
const RISK_COLORS = { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#10b981' };

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 14, { duration: 1 }); }, [center]);
  return null;
}

export default function LiveMap({ tourists = [], zones = [], incidents = [], center, routePoints = [], height = '400px' }) {
  const defaultCenter = center || [20.0082, 73.7950];

  return (
    <div style={{ height }} className="overflow-hidden border border-sy-border">
      <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}
        className="z-0" attributionControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {center && <FlyTo center={center} />}

        {/* zone circles */}
        {zones.map((z) => (
          <Circle key={z._id || z.id}
            center={[z.latitude, z.longitude]}
            radius={z.radius * 1000}
            pathOptions={{ color: ZONE_COLORS[z.type] || '#888', fillOpacity: 0.15, weight: 2 }}>
            <Popup>
              <strong>{z.name}</strong><br />
              Type: {z.type}<br />
              {z.description}
            </Popup>
          </Circle>
        ))}

        {/* route trail */}
        {routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '6 4' }} />
        )}

        {/* tourist markers */}
        {tourists.map((t) => {
          if (!t.location?.latitude) return null;
          const color = RISK_COLORS[t.riskLevel] || '#10b981';
          return (
            <CircleMarker key={t.touristId}
              center={[t.location.latitude, t.location.longitude]}
              radius={t.status === 'emergency' ? 12 : 8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}>
              <Popup>
                <strong>{t.name}</strong><br />
                ID: {t.touristId}<br />
                Risk: {t.riskLevel} ({t.riskScore})<br />
                Status: {t.status}<br />
                Zone: {t.zoneInfo?.zoneName || 'Open Area'}
              </Popup>
            </CircleMarker>
          );
        })}

        {/* SOS incident markers */}
        {incidents.filter((i) => i.status !== 'resolved').map((inc) => {
          if (!inc.location?.latitude) return null;
          return (
            <CircleMarker key={inc.incidentId || inc._id}
              center={[inc.location.latitude, inc.location.longitude]}
              radius={14}
              pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.3, weight: 3, dashArray: '4 2' }}>
              <Popup>
                <strong>🚨 {(inc.source || inc.severity || 'SOS').toUpperCase()}</strong><br />
                Tourist: {inc.touristName}<br />
                Severity: {inc.severity}<br />
                Status: {inc.status}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
