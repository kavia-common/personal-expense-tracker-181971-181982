import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/theme.css';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export function Sidebar() {
  /** Sidebar with app navigation adhering to Executive Gray theme */
  return (
    <aside className="sidebar">
      <div className="brand">
        <h1 className="title">Expense Tracker</h1>
        <p className="subtitle">Executive Gray</p>
      </div>
      <nav className="nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <span>🏠</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''}>
          <span>💳</span>
          <span>Expenses</span>
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
          <span>🏷️</span>
          <span>Categories</span>
        </NavLink>
        <NavLink to="/budgets" className={({ isActive }) => isActive ? 'active' : ''}>
          <span>📊</span>
          <span>Budgets</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
          <span>📈</span>
          <span>Reports</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <small className="muted">v1.0</small>
      </div>
    </aside>
  );
}

// PUBLIC_INTERFACE
export function Topbar({ title, children }) {
  /** Top bar showing page title and controls on the right */
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <div>
        <div className="h1">{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>Welcome{user?.username ? `, ${user.username}` : ''}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
        <button className="btn" onClick={logout} aria-label="Logout">Logout</button>
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
export default function Layout({ title, actions, children }) {
  /** Page layout with sidebar, topbar, and main content surface */
  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <Topbar title={title}>{actions}</Topbar>
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}
