import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import '../styles/theme.css';
import { ExpensesAPI, CategoriesAPI } from '../api/resources';

// PUBLIC_INTERFACE
export default function Expenses() {
  /** Expenses list with filters and create/edit/delete via modal form */
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', start: '', end: '' });
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ amount: '', date: new Date().toISOString().slice(0,10), description: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => {
    const p = {};
    if (filters.q) p.search = filters.q;
    if (filters.category) p.category = filters.category;
    if (filters.start) p.start = filters.start;
    if (filters.end) p.end = filters.end;
    return p;
  }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ExpensesAPI.list(queryParams);
      setItems(Array.isArray(data) ? data : (data?.results || []));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    CategoriesAPI.list().then((data) => setCategories(Array.isArray(data) ? data : (data?.results || []))).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  const onNew = () => {
    setEditing(null);
    setForm({ amount: '', date: new Date().toISOString().slice(0,10), description: '', category: '' });
    setError('');
    setOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      amount: row.amount ?? '',
      date: (row.date || '').slice(0,10),
      description: row.description || '',
      category: row.category || row.category_id || '',
    });
    setError('');
    setOpen(true);
  };

  const onDelete = async (row) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await ExpensesAPI.remove(row.id);
      load();
    } catch { /* ignore */ }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        amount: parseFloat(form.amount),
        date: form.date,
        description: form.description,
        category: form.category || null,
      };
      if (editing) {
        await ExpensesAPI.update(editing.id, payload);
      } else {
        await ExpensesAPI.create(payload);
      }
      setOpen(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Expenses"
      actions={<button className="btn btn-primary" onClick={onNew}>+ New</button>}
    >
      <div className="surface" style={{ padding: 12, marginBottom: 12 }}>
        <div className="grid cols-4">
          <div className="field">
            <label className="label" htmlFor="q">Search</label>
            <input id="q" className="input" placeholder="Description…" value={filters.q} onChange={(e)=>setFilters(p=>({...p,q:e.target.value}))}/>
          </div>
          <div className="field">
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="select" value={filters.category} onChange={(e)=>setFilters(p=>({...p,category:e.target.value}))}>
              <option value="">All</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="start">Start</label>
            <input id="start" type="date" className="input" value={filters.start} onChange={(e)=>setFilters(p=>({...p,start:e.target.value}))}/>
          </div>
          <div className="field">
            <label className="label" htmlFor="end">End</label>
            <input id="end" type="date" className="input" value={filters.end} onChange={(e)=>setFilters(p=>({...p,end:e.target.value}))}/>
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Description</th><th>Category</th><th style={{textAlign:'right'}}>Amount</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan="5" className="muted">No expenses.</td></tr>}
            {items.map(row => (
              <tr key={row.id}>
                <td>{(row.date || '').slice(0,10)}</td>
                <td>{row.description || '—'}</td>
                <td><span className="badge">{row.category_name || row.category?.name || '—'}</span></td>
                <td style={{textAlign:'right'}}>${Number(row.amount).toLocaleString()}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn" onClick={()=>onEdit(row)}>Edit</button>
                    <button className="btn btn-danger" onClick={()=>onDelete(row)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editing ? 'Edit Expense' : 'New Expense'}
        onClose={()=>setOpen(false)}
        footer={(
          <>
            <button className="btn" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
          </>
        )}
      >
        {error && <div className="badge" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <div className="grid cols-2">
            <div className="field">
              <label className="label" htmlFor="amount">Amount</label>
              <input id="amount" name="amount" type="number" step="0.01" className="input" value={form.amount} onChange={(e)=>setForm(p=>({...p,amount:e.target.value}))} required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="date">Date</label>
              <input id="date" name="date" type="date" className="input" value={form.date} onChange={(e)=>setForm(p=>({...p,date:e.target.value}))} required/>
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="description">Description</label>
            <input id="description" name="description" type="text" className="input" value={form.description} onChange={(e)=>setForm(p=>({...p,description:e.target.value}))}/>
          </div>
          <div className="field">
            <label className="label" htmlFor="category">Category</label>
            <select id="category" name="category" className="select" value={form.category} onChange={(e)=>setForm(p=>({...p,category:e.target.value}))}>
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
