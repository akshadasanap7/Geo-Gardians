import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { startSyncWatcher } from '../services/syncEngine';
import { getPendingCount } from '../services/db';
import api from '../services/api';

const AppContext = createContext(null);

const initialState = {
  user:          JSON.parse(localStorage.getItem('sy_user') || 'null'),
  token:         localStorage.getItem('sy_token') || null,
  networkStatus: navigator.onLine ? 'online' : 'offline',  // online | offline | syncing
  pendingSync:   0,
  socket:        null,
  liveIncidents: [],
  liveTourists:  []
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('sy_token', action.token);
      localStorage.setItem('sy_user',  JSON.stringify(action.user));
      return { ...state, user: action.user, token: action.token };
    case 'LOGOUT':
      localStorage.removeItem('sy_token');
      localStorage.removeItem('sy_user');
      return { ...state, user: null, token: null };
    case 'SET_NETWORK':    return { ...state, networkStatus: action.status };
    case 'SET_PENDING':    return { ...state, pendingSync: action.count };
    case 'SET_SOCKET':     return { ...state, socket: action.socket };
    case 'INCIDENT_NEW':   return { ...state, liveIncidents: [action.incident, ...state.liveIncidents].slice(0, 50) };
    case 'INCIDENT_UPD':   return { ...state, liveIncidents: state.liveIncidents.map((i) => i.incidentId === action.incident.incidentId ? action.incident : i) };
    case 'LOCATION_UPD':   return { ...state, liveTourists: state.liveTourists.map((t) => t.touristId === action.data.touristId ? { ...t, ...action.data } : t) };
    case 'SET_TOURISTS':   return { ...state, liveTourists: action.tourists };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [authChecked, setAuthChecked] = useState(false);
  const socketRef = useRef(null);

  // verify saved token on app start
  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem('sy_token');
      if (!token) { setAuthChecked(true); return; }
      try {
        const data = await api.get('/auth/me');
        dispatch({ type: 'LOGIN', token, user: data.user });
      } catch {
        localStorage.removeItem('sy_token');
        localStorage.removeItem('sy_user');
        dispatch({ type: 'LOGOUT' });
      } finally {
        setAuthChecked(true);
      }
    }
    verifyToken();
  }, []);

  // sync watcher
  useEffect(() => {
    const stop = startSyncWatcher(
      (status) => dispatch({ type: 'SET_NETWORK', status }),
      async () => {
        const count = await getPendingCount();
        dispatch({ type: 'SET_PENDING', count });
      }
    );
    getPendingCount().then((count) => dispatch({ type: 'SET_PENDING', count }));
    return stop;
  }, []);

  // socket.io
  useEffect(() => {
    if (!state.token) return;
    const socket = io('/', { auth: { token: state.token }, transports: ['websocket'] });
    socketRef.current = socket;
    dispatch({ type: 'SET_SOCKET', socket });

    socket.on('incident:new',     (inc)  => dispatch({ type: 'INCIDENT_NEW', incident: inc }));
    socket.on('incident:sos',     (data) => dispatch({ type: 'INCIDENT_NEW', incident: data.incident }));
    socket.on('incident:updated', (inc)  => dispatch({ type: 'INCIDENT_UPD', incident: inc }));
    socket.on('location:update',  (data) => dispatch({ type: 'LOCATION_UPD', data }));

    return () => socket.disconnect();
  }, [state.token]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-sy-bg flex items-center justify-center">
        <div className="text-sy-accent text-2xl font-black animate-pulse">🛡️ SafeYatra AI</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
