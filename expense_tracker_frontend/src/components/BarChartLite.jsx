import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Very lightweight bar representation without external libs.
 * Pass data as [{ label: string, value: number }]
 */
export default function BarChartLite({ data = [] }) {
  const max = Math.max(1, ...data.map(d => d.value || 0));
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr max-content', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{d.label}</div>
          <div style={{ background: '#E5E7EB', borderRadius: 6, overflow: 'hidden', height: 10 }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: '#374151', height: '100%' }} />
          </div>
          <div style={{ fontSize: 12, color: '#111827', fontWeight: 700 }}>${Number(d.value).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
