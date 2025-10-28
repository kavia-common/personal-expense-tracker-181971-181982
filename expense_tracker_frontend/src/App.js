import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/theme.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';

/**
 * PUBLIC_INTERFACE
 * Shell router with protected app routes.
 */
function Shell() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component mounting AuthProvider and router shell.
   */
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
