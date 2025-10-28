import React from 'react';
import '../styles/theme.css';

// PUBLIC_INTERFACE
export default function Modal({ open, title, onClose, children, footer }) {
  /** Accessible simple modal with backdrop; controlled via open prop */
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
      <div className="modal">
        {title && <div className="h2" style={{ marginBottom: 6 }}>{title}</div>}
        <div>
          {children}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          {footer || <button className="btn" onClick={onClose}>Close</button>}
        </div>
      </div>
    </div>
  );
}
