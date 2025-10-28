import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import '../styles/theme.css';
import { CategoriesAPI } from '../api/resources';

// PUBLIC_INTERFACE
export default function Categories() {
  /** Categories management with color */
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#374151' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const data = await CategoriesAPI.list().catch(()=>[]);
    setItems(Array.isArray(data) ? data : (data?.results || []));
  };

  useEffect(() => { load(); }, []);

  const onNew = () => { setEditing(null); setForm({ name: '', color: '#374151' }); setOpen(true); };
  const onEdit = (row) => { setEditing(row); setForm({ name: row.name || '', color: row.color || '#374151' }); setOpen(true); };
  const onDelete = async (row) => { if (window.confirm('Delete this category?')) { await CategoriesAPI.remove(row.id).catch(()=>{}); load(); } };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await CategoriesAPI.update(editing.id, form);
      } else {
        await CategoriesAPI.create(form);
      }
      setOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Categories" actions={<button className="btn btn-primary" onClick={onNew}>+ New</button>}>
      <div className="surface" style={{ padding: 12 }}>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Color</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="3" className="muted">No categories.</td></tr>}
            {items.map(row => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>
                  <span className="badge" style={{ background: row.color || '#F3F4F6', color: '#111827', borderColor: '#E5E7EB' }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, background: row.color || '#374151', marginRight: 6 }} />
                    {row.color || '—'}
                  </span>
                </td>
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
        title={editing ? 'Edit Category' : 'New Category'}
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
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))} required/>
          </div>
          <div className="field">
            <label className="label" htmlFor="color">Color</label>
            <input id="color" type="color" className="input" value={form.color} onChange={(e)=>setForm(p=>({...p,color:e.target.value}))}/>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
