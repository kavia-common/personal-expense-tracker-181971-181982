import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';

// Simple placeholder Dashboard to demonstrate protected route and logout
function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="App">
      <header className="App-header" style={{ paddingTop: 80 }}>
        <h2 style={{ marginBottom: 8 }}>Dashboard</h2>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          Welcome{user?.username ? `, ${user.username}` : ''}!
        </p>
        <nav style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Link className="App-link" to="/dashboard">Home</Link>
        </nav>
        <button className="theme-toggle" onClick={logout} aria-label="Logout">
          Logout
        </button>
      </header>
    </div>
  );
}

// PUBLIC_INTERFACE
function Shell() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
