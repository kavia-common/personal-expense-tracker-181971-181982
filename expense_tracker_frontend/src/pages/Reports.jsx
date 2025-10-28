import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/theme.css';
import { ReportsAPI } from '../api/resources';

// PUBLIC_INTERFACE
export default function Reports() {
  /** Reports consuming /reports/summary and /reports/budget-status and rendering tables */
  const [summary, setSummary] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [s, b] = await Promise.all([ReportsAPI.summary(), ReportsAPI.budgetStatus()]);
        if (mounted) {
          setSummary(s);
          setBudgetStatus(b);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const series = useMemo(() => {
    const perCategory = summary?.per_category || summary?.by_category || {};
    return Object.entries(perCategory);
  }, [summary]);

  return (
    <Layout title="Reports">
      {loading && <div className="surface" style={{ padding: 12 }}>Loading…</div>}
      {!loading && (
        <>
          <div className="grid cols-3">
            <div className="surface kpi">
              <div className="kpi-title">Total Spent</div>
              <div className="kpi-value">${Number(summary?.total || 0).toLocaleString()}</div>
            </div>
            <div className="surface kpi">
              <div className="kpi-title">This Month</div>
              <div className="kpi-value">${Number(summary?.current_month_spent || summary?.month_spent || 0).toLocaleString()}</div>
            </div>
            <div className="surface kpi">
              <div className="kpi-title">Transactions</div>
              <div className="kpi-value">{Number(summary?.total_transactions || summary?.count || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="grid cols-2" style={{ marginTop: 12 }}>
            <div className="surface" style={{ padding: 12 }}>
              <div className="h2">Spending by Category</div>
              <table className="table" style={{ marginTop: 6 }}>
                <thead>
                  <tr><th>Category</th><th style={{textAlign:'right'}}>Amount</th></tr>
                </thead>
                <tbody>
                  {series.length === 0 && <tr><td colSpan="2" className="muted">No data.</td></tr>}
                  {series.map(([name, amount]) => (
                    <tr key={name}><td>{name}</td><td style={{textAlign:'right'}}>${Number(amount).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="surface" style={{ padding: 12 }}>
              <div className="h2">Budget Status</div>
              <table className="table" style={{ marginTop: 6 }}>
                <thead>
                  <tr><th>Category</th><th>Budget</th><th>Spent</th><th>Remaining</th></tr>
                </thead>
                <tbody>
                  {Array.isArray(budgetStatus) && budgetStatus.length === 0 && <tr><td colSpan="4" className="muted">No budgets.</td></tr>}
                  {Array.isArray(budgetStatus) && budgetStatus.map((b, idx) => {
                    const remaining = (b.budget_amount ?? 0) - (b.spent ?? 0);
                    return (
                      <tr key={b.id || idx}>
                        <td>{b.category_name || b.category || 'All'}</td>
                        <td>${Number(b.budget_amount ?? b.amount ?? 0).toLocaleString()}</td>
                        <td>${Number(b.spent ?? 0).toLocaleString()}</td>
                        <td>
                          <span className="badge" style={{ background: remaining < 0 ? '#FEE2E2' : '#ECFDF5', color: remaining < 0 ? '#991B1B' : '#065F46', borderColor: remaining < 0 ? '#FCA5A5' : '#A7F3D0' }}>
                            ${Number(remaining).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!Array.isArray(budgetStatus) && <tr><td colSpan="4" className="muted">No data.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
