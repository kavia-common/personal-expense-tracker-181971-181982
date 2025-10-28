import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/theme.css';
import { ReportsAPI, ExpensesAPI, CategoriesAPI } from '../api/resources';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Dashboard shows summary KPIs, recent expenses, and quick add form */
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: '',
  });
  const [error, setError] = useState('');

  const totalSpent = useMemo(() => {
    const v = summary?.total_spent ?? summary?.total;
    return v ?? 0;
  }, [summary]);
  const totalCount = useMemo(() => {
    const v = summary?.count ?? summary?.total_transactions;
    return v ?? 0;
  }, [summary]);
  const monthSpent = useMemo(() => {
    const v = summary?.month_spent ?? summary?.current_month_spent;
    return v ?? 0;
  }, [summary]);

  useEffect(() => {
    let mounted = true;
    ReportsAPI.summary().then((data) => { if (mounted) setSummary(data); }).catch(() => {});
    ExpensesAPI.list({ limit: 5 }).then((data) => { if (mounted) setRecent(Array.isArray(data) ? data : (data?.results || [])); }).catch(() => {});
    CategoriesAPI.list().then((data) => { if (mounted) setCategories(Array.isArray(data) ? data : (data?.results || [])); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      const payload = {
        amount: parseFloat(form.amount),
        date: form.date,
        description: form.description,
        category: form.category || null,
      };
      await ExpensesAPI.create(payload);
      setForm((p) => ({ ...p, amount: '', description: '' }));
      const fresh = await ExpensesAPI.list({ limit: 5 });
      setRecent(Array.isArray(fresh) ? fresh : (fresh?.results || []));
      const s = await ReportsAPI.summary();
      setSummary(s);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add expense.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Layout title="Dashboard" actions={null}>
      <div className="grid cols-3">
        <div className="surface kpi">
          <div className="kpi-title">Total Spent</div>
          <div className="kpi-value">${Number(totalSpent || 0).toLocaleString()}</div>
        </div>
        <div className="surface kpi">
          <div className="kpi-title">This Month</div>
          <div className="kpi-value">${Number(monthSpent || 0).toLocaleString()}</div>
        </div>
        <div className="surface kpi">
          <div className="kpi-title">Transactions</div>
          <div className="kpi-value">{Number(totalCount || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 12 }}>
        <div className="surface" style={{ padding: 14 }}>
          <div className="h2">Quick Add</div>
          {error && <div className="badge" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>{error}</div>}
          <form className="form" onSubmit={handleQuickAdd}>
            <div className="grid cols-2">
              <div className="field">
                <label className="label" htmlFor="amount">Amount</label>
                <input id="amount" name="amount" type="number" step="0.01" className="input" value={form.amount} onChange={handleChange} required />
              </div>
              <div className="field">
                <label className="label" htmlFor="date">Date</label>
                <input id="date" name="date" type="date" className="input" value={form.date} onChange={handleChange} required />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="description">Description</label>
              <input id="description" name="description" type="text" className="input" placeholder="e.g., Lunch at Bistro" value={form.description} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="label" htmlFor="category">Category</label>
              <select id="category" name="category" className="select" value={form.category} onChange={handleChange}>
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <button className="btn btn-primary" disabled={adding}>{adding ? 'Adding…' : 'Add Expense'}</button>
            </div>
          </form>
        </div>
        <div className="surface" style={{ padding: 14 }}>
          <div className="h2">Recent Expenses</div>
          <table className="table" style={{ marginTop: 6 }}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan="3" className="muted">No recent expenses.</td></tr>
              )}
              {recent.map((e) => (
                <tr key={e.id}>
                  <td>{e.description || '—'}</td>
                  <td>{e.category_name || e.category?.name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>${Number(e.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
