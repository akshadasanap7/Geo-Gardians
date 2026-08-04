import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { primaryTourist, mockTourists } from '../data/mockTourists';
import { mockIncidents } from '../data/mockIncidents';
import { mockZones } from '../data/mockZones';
import { calculateRisk } from '../services/riskService';
import { createIncident, advanceIncident } from '../services/incidentService';
import { getNextMovementPoint } from '../services/locationService';
import { getPendingEvents, queuePendingEvent, syncPendingEvents } from '../services/syncService';
import { findZone, getZoneMessage } from '../services/geofenceService';
import { loginUser, signupTourist, saveSession, clearSession, getStoredUser } from '../services/authService';

const STORAGE_KEY = 'safeyatra_demo_state';
const AppContext = createContext(null);

function readSavedState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

const savedState = readSavedState();
const initialState = {
  user: savedState?.user || getStoredUser() || null,
  networkStatus: savedState?.networkStatus || 'online',
  pendingSync: getPendingEvents().length,
  tourists: savedState?.tourists || mockTourists,
  incidents: savedState?.incidents || mockIncidents,
  zones: mockZones,
  selectedEntity: savedState?.selectedEntity || primaryTourist.touristId,
  demo: savedState?.demo || { tracking: true, journeyActive: true, routeIndex: 1, inDangerZone: false, inactivityMins: 0, weather: 'clear' },
  toasts: [],
  lastSyncAt: savedState?.lastSyncAt || '08:42 UTC'
};

function buildTouristFromUser(user) {
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return {
    touristId:        `SY-${user.id?.slice(-6)?.toUpperCase() || 'USER01'}`,
    userId:           user.id,
    name:             user.name,
    initials,
    phone:            user.phone || '',
    emergencyContact: user.phone || '',
    email:            user.email,
    destination:      'My Journey',
    riskScore:        0,
    riskLevel:        'SAFE',
    status:           'journey-active',
    isOnline:         true,
    lastSeen:         'Just now',
    location:         { latitude: 20.0059, longitude: 73.7897 },
    zoneName:         'Safe Zone',
    zoneType:         'safe',
    journey:          'My active journey',
    journeyProgress:  0,
    verified:         true,
    lastCheckIn:      new Date().toISOString().slice(11, 16) + ' UTC',
    digitalId:        `SY-2026-${(user.id || 'DEMO').slice(-6).toUpperCase()}`,
    qrCode:           `SY-${(user.id || 'DEMO').slice(-6).toUpperCase()}`,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      // upsert a tourist record for this user so all tourist pages show their data
      const existing = state.tourists.find((t) => t.userId === action.user.id);
      const myTourist = existing
        ? { ...existing, name: action.user.name, phone: action.user.phone || existing.phone, email: action.user.email }
        : buildTouristFromUser(action.user);
      const tourists = existing
        ? state.tourists.map((t) => t.userId === action.user.id ? myTourist : t)
        : [myTourist, ...state.tourists];
      return { ...state, user: action.user, tourists, selectedEntity: myTourist.touristId };
    }
    case 'LOGOUT': return { ...state, user: null };
    case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.patch } };
    case 'SET_NETWORK': return { ...state, networkStatus: action.status };
    case 'SET_PENDING': return { ...state, pendingSync: action.count };
    case 'SET_DEMO': return { ...state, demo: { ...state.demo, ...action.patch } };
    case 'SET_SELECTED': return { ...state, selectedEntity: action.id };
    case 'UPDATE_TOURIST': return { ...state, tourists: state.tourists.map((tourist) => tourist.touristId === action.id ? { ...tourist, ...action.patch } : tourist) };
    case 'ADD_INCIDENT': return { ...state, incidents: [action.incident, ...state.incidents], selectedEntity: action.incident.touristId };
    case 'UPDATE_INCIDENT': return { ...state, incidents: state.incidents.map((incident) => incident.incidentId === action.incident.incidentId ? action.incident : incident) };
    case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, action.toast].slice(-4) };
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    case 'SET_LAST_SYNC': return { ...state, lastSyncAt: action.value };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = `${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type, title } });
    window.setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), type === 'error' ? 8000 : 5000);
  }, []);

  const dismissToast = useCallback((id) => dispatch({ type: 'REMOVE_TOAST', id }), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, networkStatus: state.networkStatus, tourists: state.tourists, incidents: state.incidents, selectedEntity: state.selectedEntity, demo: state.demo, lastSyncAt: state.lastSyncAt }));
  }, [state.user, state.networkStatus, state.tourists, state.incidents, state.selectedEntity, state.demo, state.lastSyncAt]);

  const login = useCallback(async (credentials) => {
    let user;
    if (credentials.mode === 'signup') {
      const res = await signupTourist(credentials);
      saveSession(res.token, res.user);
      user = res.user;
      addToast(`Welcome, ${user.name}! Your account is ready.`, 'success', 'Registration complete');
    } else {
      const res = await loginUser(credentials);
      saveSession(res.token, res.user);
      user = res.user;
      addToast(`Signed in as ${user.name}.`, 'success', 'Workspace ready');
    }
    dispatch({ type: 'LOGIN', user });
    return user;
  }, [addToast]);

  const logout = useCallback(() => {
    clearSession();
    dispatch({ type: 'LOGOUT' });
    addToast('You have been signed out.', 'info', 'Signed out');
  }, [addToast]);

  const setNetworkStatus = useCallback((status) => dispatch({ type: 'SET_NETWORK', status }), []);

  const simulateNetworkLoss = useCallback(() => {
    dispatch({ type: 'SET_NETWORK', status: 'offline' });
    addToast('Cloud updates paused. GPS, geo-fencing, AI risk and SOS remain active locally.', 'warning', 'Offline mode');
  }, [addToast]);

  const restoreNetwork = useCallback(async () => {
    dispatch({ type: 'SET_NETWORK', status: 'syncing' });
    addToast('Uploading pending emergency data and location packets.', 'sync', 'Sync started');
    const pending = getPendingEvents();
    await syncPendingEvents();
    dispatch({ type: 'SET_NETWORK', status: 'synced' });
    dispatch({ type: 'SET_PENDING', count: 0 });
    dispatch({ type: 'SET_LAST_SYNC', value: new Date().toISOString().slice(11, 16) + ' UTC' });
    addToast(`${pending.length || 0} queued event${pending.length === 1 ? '' : 's'} reconciled with command center.`, 'success', 'Sync complete');
    window.setTimeout(() => dispatch({ type: 'SET_NETWORK', status: 'online' }), 1600);
  }, [addToast]);

  const updatePrimaryTourist = useCallback((patch) => {
    const myTourist = state.tourists.find((t) => t.userId === state.user?.id) || state.tourists[0];
    dispatch({ type: 'UPDATE_TOURIST', id: myTourist.touristId, patch });
  }, [state.tourists, state.user]);

  const simulateMovement = useCallback(() => {
    const nextIndex = (state.demo.routeIndex + 1) % 5;
    const location = getNextMovementPoint(nextIndex);
    const zone = findZone(location, state.zones);
    const risk = calculateRisk({ baseScore: 18, inDangerZone: state.demo.inDangerZone, inactivityMins: state.demo.inactivityMins, weather: state.demo.weather });
    updatePrimaryTourist({ location, lastSeen: 'Just now', zoneName: zone?.name || 'Monitored corridor', zoneType: zone?.type || 'safe', riskScore: risk.score, riskLevel: risk.level });
    dispatch({ type: 'SET_DEMO', patch: { routeIndex: nextIndex } });
    addToast(`GPS moved to ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}.`, 'info', 'Journey update');
  }, [addToast, state.demo, state.zones, updatePrimaryTourist]);

  const enterDangerZone = useCallback(() => {
    const zone = state.zones.find((item) => item.type === 'danger');
    const risk = calculateRisk({ baseScore: 18, inDangerZone: true, inactivityMins: state.demo.inactivityMins, weather: state.demo.weather });
    updatePrimaryTourist({ location: { latitude: zone.latitude, longitude: zone.longitude }, zoneName: zone.name, zoneType: zone.type, riskScore: Math.max(87, risk.score), riskLevel: 'HIGH', lastSeen: 'Just now' });
    dispatch({ type: 'SET_DEMO', patch: { inDangerZone: true, routeIndex: 2 } });
    addToast(`${getZoneMessage(zone)} Your risk score is now ${Math.max(87, risk.score)}%.`, 'warning', 'Danger zone detected');
  }, [addToast, state.demo, state.zones, updatePrimaryTourist]);

  const simulateHighRisk = useCallback(() => {
    updatePrimaryTourist({ riskScore: 87, riskLevel: 'HIGH', zoneType: 'danger', zoneName: 'Gangapur Dam Service Road', lastSeen: 'Just now' });
    dispatch({ type: 'SET_DEMO', patch: { inDangerZone: true, inactivityMins: 25 } });
    addToast('Tourist warning issued. Authority escalation workflow is ready.', 'error', 'High risk detected');
  }, [addToast, updatePrimaryTourist]);

  const simulateInactivity = useCallback(() => {
    dispatch({ type: 'SET_DEMO', patch: { inactivityMins: 25 } });
    const risk = calculateRisk({ baseScore: 18, inDangerZone: state.demo.inDangerZone, inactivityMins: 25, weather: state.demo.weather });
    updatePrimaryTourist({ riskScore: risk.score, riskLevel: risk.level });
    addToast('No movement detected for 25 minutes. Respond to the safety check-in.', 'warning', 'Inactivity alert');
  }, [addToast, state.demo, updatePrimaryTourist]);

  const triggerSOS = useCallback(({ touristId = primaryTourist.touristId, source = 'SOS' } = {}) => {
    const tourist = state.tourists.find((item) => item.touristId === touristId) || state.tourists[0];
    const incident = createIncident({ tourist, reason: 'SOS + Live GPS captured + Manual escalation', source, severity: 'CRITICAL', riskScore: 94 });
    dispatch({ type: 'ADD_INCIDENT', incident });
    updatePrimaryTourist({ status: 'emergency', riskScore: 94, riskLevel: 'CRITICAL', lastSeen: 'Just now' });
    if (state.networkStatus !== 'online') {
      const queue = queuePendingEvent({ type: 'incident', incidentId: incident.incidentId, touristId: tourist.touristId });
      dispatch({ type: 'SET_PENDING', count: queue.length });
    }
    addToast(state.networkStatus === 'online' ? 'Authority and emergency contact notified.' : 'SOS stored locally and marked for automatic sync.', 'error', 'SOS alert created');
    return incident;
  }, [addToast, state.networkStatus, state.tourists, updatePrimaryTourist]);

  const updateIncidentStatus = useCallback((incidentId, status, actor = 'Control Room', note = '') => {
    const incident = state.incidents.find((item) => item.incidentId === incidentId);
    if (!incident) return;
    const updated = advanceIncident(incident, status, actor, note);
    if (status === 'responder-assigned') updated.assignedResponder = 'Unit Alpha-07';
    dispatch({ type: 'UPDATE_INCIDENT', incident: updated });
    addToast(`${incidentId} moved to ${status.replace('-', ' ')}.`, 'success', 'Incident workflow');
  }, [addToast, state.incidents]);

  const resolveLatestIncident = useCallback(() => {
    const latest = state.incidents.find((incident) => incident.status !== 'resolved');
    if (latest) updateIncidentStatus(latest.incidentId, 'resolved', 'Demo operator', 'Resolved during walkthrough');
  }, [state.incidents, updateIncidentStatus]);

  const value = useMemo(() => ({
    state,
    dispatch,
    addToast,
    dismissToast,
    login,
    logout,
    setNetworkStatus,
    simulateNetworkLoss,
    restoreNetwork,
    simulateMovement,
    enterDangerZone,
    simulateHighRisk,
    simulateInactivity,
    triggerSOS,
    updateIncidentStatus,
    resolveLatestIncident
  }), [state, addToast, dismissToast, login, logout, setNetworkStatus, simulateNetworkLoss, restoreNetwork, simulateMovement, enterDangerZone, simulateHighRisk, simulateInactivity, triggerSOS, updateIncidentStatus, resolveLatestIncident]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
