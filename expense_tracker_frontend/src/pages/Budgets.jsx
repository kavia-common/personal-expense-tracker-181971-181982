import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import '../styles/theme.css';
import { BudgetsAPI, CategoriesAPI } from '../api/resources';

// PUBLIC_INTERFACE
export default function Budgets() {
  /** Budgets management with amount, category and period */
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', amount: '', period: 'monthly', start_date: '', end_date: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const data = await BudgetsAPI.list().catch(()=>[]);
    setItems(Array.isArray(data) ? data : (data?.results || []));
  };

  useEffect(() => { load(); CategoriesAPI.list().then(d=>setCategories(Array.isArray(d)?d:(d?.results||[]))).catch(()=>{}); }, []);

  const onNew = () => { setEditing(null); setForm({ category: '', amount: '', period: 'monthly', start_date: '', end_date: '' }); setOpen(true); };
  const onEdit = (row) => {
    setEditing(row);
    setForm({
      category: row.category || row.category_id || '',
      amount: row.amount ?? '',
      period: row.period || 'monthly',
      start_date: row.start_date || '',
      end_date: row.end_date || '',
    });
    setOpen(true);
  };
  const onDelete = async (row) => { if (window.confirm('Delete this budget?')) { await BudgetsAPI.remove(row.id).catch(()=>{}); load(); } };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      category: form.category || null,
      amount: parseFloat(form.amount),
      period: form.period,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    try {
      if (editing) await BudgetsAPI.update(editing.id, payload);
      else await BudgetsAPI.create(payload);
      setOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Budgets" actions={<button className="btn btn-primary" onClick={onNew}>+ New</button>}>
      <div className="surface" style={{ padding: 12 }}>
        <table className="table">
          <thead>
            <tr><th>Category</th><th>Amount</th><th>Period</th><th>Start</th><th>End</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="6" className="muted">No budgets.</td></tr>}
            {items.map(row => (
              <tr key={row.id}>
                <td>{row.category_name || row.category?.name || 'All'}</td>
                <td>${Number(row.amount).toLocaleString()}</td>
                <td><span className="badge">{row.period}</span></td>
                <td>{row.start_date || '—'}</td>
                <td>{row.end_date || '—'}</td>
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
        title={editing ? 'Edit Budget' : 'New Budget'}
        onClose={()=>setOpen(false)}
        footer={(
          <>
            <button className="btn" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
          </>
        )}
      >
        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="select" value={form.category} onChange={(e)=>setForm(p=>({...p,category:e.target.value}))}>
              <option value="">All Categories</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid cols-2">
            <div className="field">
              <label className="label" htmlFor="amount">Amount</label>
              <input id="amount" type="number" step="0.01" className="input" value={form.amount} onChange={(e)=>setForm(p=>({...p,amount:e.target.value}))} required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="period">Period</label>
              <select id="period" className="select" value={form.period} onChange={(e)=>setForm(p=>({...p,period:e.target.value}))}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="grid cols-2">
            <div className="field">
              <label className="label" htmlFor="start_date">Start date (optional)</label>
              <input id="start_date" type="date" className="input" value={form.start_date} onChange={(e)=>setForm(p=>({...p,start_date:e.target.value}))}/>
            </div>
            <div className="field">
              <label className="label" htmlFor="end_date">End date (optional)</label>
              <input id="end_date" type="date" className="input" value={form.end_date} onChange={(e)=>setForm(p=>({...p,end_date:e.target.value}))}/>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
