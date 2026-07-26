import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import LandingPage from './pages/LandingPage';
import InfoPage from './pages/InfoPage';
import LoginPage from './pages/LoginPage';
import { TouristDashboard, TouristJourney, TouristSafety, TouristDigitalId, TouristEmergency, TouristProfile } from './pages/TouristPages';
import { AuthorityDashboard, AuthorityLiveMap, AuthorityIncidents, AuthorityTourists, AuthorityGeofences, AuthorityIdVerification, AuthorityAnalytics } from './pages/AuthorityPages';
import { ResponderDashboard, ResponderIncidents, ResponderNavigation } from './pages/ResponderPages';
import { AdminDashboard, AdminUsers, AdminZones, AdminSettings, AdminAuditLogs } from './pages/AdminPages';
import ProtectedRoute from './components/shared/ProtectedRoute';
import './index.css';

function RoleHome() {
  const { state } = useApp();
  return <Navigate to={state.user ? `/${state.user.role}/dashboard` : '/'} replace />;
}

function NotFound() {
  return <div className="grid min-h-screen place-items-center bg-sy-bg px-6 text-center text-white"><div><p className="sy-label text-sy-accent">404 / signal lost</p><h1 className="mt-3 text-4xl font-extrabold">This route is not monitored.</h1><p className="mt-3 text-sm text-white/50">Return to the public network or open a role workspace.</p><a href="/" className="mt-6 inline-flex min-h-11 items-center justify-center bg-sy-accent px-4 text-xs font-extrabold text-sy-bg">Return home</a></div></div>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<InfoPage />} />
    <Route path="/how-it-works" element={<InfoPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<LoginPage register />} />
    <Route element={<ProtectedRoute role="tourist" />}>
      <Route path="/tourist/dashboard" element={<TouristDashboard />} />
      <Route path="/tourist/journey" element={<TouristJourney />} />
      <Route path="/tourist/safety" element={<TouristSafety />} />
      <Route path="/tourist/digital-id" element={<TouristDigitalId />} />
      <Route path="/tourist/emergency" element={<TouristEmergency />} />
      <Route path="/tourist/profile" element={<TouristProfile />} />
    </Route>
    <Route element={<ProtectedRoute role="authority" />}>
      <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
      <Route path="/authority/live-map" element={<AuthorityLiveMap />} />
      <Route path="/authority/incidents" element={<AuthorityIncidents />} />
      <Route path="/authority/tourists" element={<AuthorityTourists />} />
      <Route path="/authority/geofences" element={<AuthorityGeofences />} />
      <Route path="/authority/id-verification" element={<AuthorityIdVerification />} />
      <Route path="/authority/analytics" element={<AuthorityAnalytics />} />
    </Route>
    <Route element={<ProtectedRoute role="responder" />}>
      <Route path="/responder/dashboard" element={<ResponderDashboard />} />
      <Route path="/responder/incidents" element={<ResponderIncidents />} />
      <Route path="/responder/navigation" element={<ResponderNavigation />} />
    </Route>
    <Route element={<ProtectedRoute role="admin" />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/zones" element={<AdminZones />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
    </Route>
    <Route path="/workspace" element={<RoleHome />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AppProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppProvider></React.StrictMode>);
