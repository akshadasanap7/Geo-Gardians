import { useState, useCallback } from 'react';
import api from '../services/api';

export function useRiskEngine() {
  const [risk, setRisk] = useState({ score: 0, level: 'LOW', factors: [] });
  const [loading, setLoading] = useState(false);

  const evaluate = useCallback(async ({ latitude, longitude, weather = 'clear', speed = 0, inactivityMins = 0, zones = [] }) => {
    setLoading(true);
    try {
      // call backend location update which internally calls AI service
      const ZONE_SCORES = { safe: 0, caution: 25, danger: 45, restricted: 55 };
      const WEATHER_SCORES = { clear: 0, 'heavy-rain': 15, storm: 25, flood: 30, landslide: 35 };

      function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371, toRad = (v) => (v * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      const zone = zones.find((z) => haversine(latitude, longitude, z.latitude, z.longitude) <= z.radius);
      const locationRisk = ZONE_SCORES[zone?.type] || 0;
      const weatherRisk  = WEATHER_SCORES[weather] || 0;
      const nightTime    = new Date().getHours() < 5 || new Date().getHours() >= 22 ? 1 : 0;

      // Try AI service directly
      try {
        const res = await fetch('http://localhost:8000/predict-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationRisk, inactivityMinutes: inactivityMins, speed, nightTime, weatherRisk })
        });
        if (res.ok) {
          const data = await res.json();
          setRisk({ score: data.riskScore, level: data.riskLevel, factors: data.reasons });
          return;
        }
      } catch { /* fall through to local */ }

      // Local fallback
      let score = locationRisk * 0.4 + Math.min(inactivityMins, 60) / 60 * 25 + (1 - Math.min(speed, 10) / 10) * 10 + nightTime * 12 + weatherRisk * 0.35 + 10;
      score = Math.min(100, Math.round(score));
      const level = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';
      const factors = [];
      if (locationRisk >= 45) factors.push('Danger zone');
      else if (locationRisk >= 25) factors.push('Caution zone');
      if (weatherRisk >= 25) factors.push(`Severe weather: ${weather}`);
      if (inactivityMins >= 30) factors.push(`Inactive ${inactivityMins} min`);
      if (nightTime) factors.push('Late night hours');
      if (!factors.length) factors.push('Baseline monitoring active');
      setRisk({ score, level, factors });
    } finally {
      setLoading(false);
    }
  }, []);

  return { risk, loading, evaluate };
}
