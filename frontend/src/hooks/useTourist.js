import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import api from '../services/api';
import { saveLocationOffline, cacheTourist, getCachedTourist } from '../services/db';
import { useApp } from '../store/AppContext';

export function useTourist() {
  const { state } = useApp();
  const [tourist, setTourist]   = useState(null);
  const [zones, setZones]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef(null);

  // load tourist profile + zones on mount
  useEffect(() => {
    async function load() {
      try {
        const [tourists, z] = await Promise.all([api.get('/tourists'), api.get('/geofences')]);
        const mine = tourists[0] || null;
        if (mine) { setTourist(mine); await cacheTourist(mine); }
        else {
          const cached = await getCachedTourist(state.user?.id);
          if (cached) setTourist(cached);
        }
        setZones(z);
      } catch {
        const cached = await getCachedTourist(state.user?.id);
        if (cached) setTourist(cached);
      } finally {
        setLoading(false);
      }
    }
    if (state.user) load();
  }, [state.user]);

  const registerTourist = useCallback(async (formData) => {
    const data = await api.post('/tourists', formData);
    setTourist(data);
    await cacheTourist(data);
    return data;
  }, []);

  const sendLocation = useCallback(async (coords, extra = {}) => {
    const payload = {
      touristId:     tourist?.touristId,
      latitude:      coords.latitude,
      longitude:     coords.longitude,
      accuracy:      coords.accuracy,
      speed:         coords.speed || 0,
      clientId:      uuid(),
      weather:       extra.weather || 'clear',
      inactivityMins: extra.inactivityMins || 0
    };
    try {
      if (state.networkStatus === 'online') {
        const res = await api.post('/locations', payload);
        setTourist((t) => t ? { ...t, latestRiskScore: res.risk?.score, latestRiskLevel: res.risk?.level, latestRiskFactors: res.risk?.factors, lastLocation: { latitude: coords.latitude, longitude: coords.longitude } } : t);
      } else {
        await saveLocationOffline(payload);
      }
    } catch {
      await saveLocationOffline(payload);
    }
  }, [tourist, state.networkStatus]);

  const startTracking = useCallback((extra = {}) => {
    if (!navigator.geolocation || !tourist) return;
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords, extra),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, [tourist, sendLocation]);

  const stopTracking = useCallback(() => {
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    setTracking(false);
  }, []);

  return { tourist, zones, loading, tracking, registerTourist, sendLocation, startTracking, stopTracking };
}
