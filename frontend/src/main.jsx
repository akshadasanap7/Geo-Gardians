import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TouristDashboard from './pages/TouristDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResponderDashboard from './pages/ResponderDashboard';
import './index.css';

function RoleRouter() {
  const { state } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  if (state.user && state.token) {
    const role = state.user.role;
    if (role === 'admin')     return <AdminDashboard />;
    if (role === 'authority') return <AuthorityDashboard />;
    if (role === 'responder') return <ResponderDashboard />;
    return <TouristDashboard />;
  }

  if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  return <LandingPage onGetStarted={() => setShowLogin(true)} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<RoleRouter />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
