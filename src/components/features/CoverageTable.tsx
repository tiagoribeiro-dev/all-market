'use client';

import { useEffect, useState } from 'react';
import { MapPinned } from 'lucide-react';
import Card from '@/components/ui/Card';

interface CoverageRow {
  key: string;
  labelPT: string;
  labelEN: string;
  open: boolean;
  waitlist: number;
  pros: number;
  pendingPros: number;
}

// Admin: approved pros and waiting-list demand per district — the data behind
// deciding where to open next (and, later, the Portugal map).
export default function CoverageTable({ pt }: { pt: boolean }) {
  const [rows, setRows] = useState<CoverageRow[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/coverage')
      .then((r) => (r.ok ? r.json() : { rows: [] }))
      .then((d) => setRows(d.rows ?? []))
      .catch(() => setRows([]));
  }, []);

  // Open districts first, then by demand + supply.
  const sorted = (rows ?? []).slice().sort((a, b) =>
    Number(b.open) - Number(a.open) || (b.waitlist + b.pros + b.pendingPros) - (a.waitlist + a.pros + a.pendingPros));

  const cell = { padding: '8px 10px', fontSize: '13px', borderBottom: '1px solid var(--border)' } as const;

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPinned size={22} color="var(--accent)" />
        {pt ? 'Cobertura por distrito' : 'Coverage by district'}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {pt
          ? 'Profissionais aprovados e pessoas em lista de espera. Para abrir um distrito, acrescenta-o em src/lib/launch.ts.'
          : 'Approved professionals and people on the waiting list. To open a district, add it in src/lib/launch.ts.'}
      </p>
      {rows === null ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{pt ? 'A carregar...' : 'Loading...'}</p>
      ) : (
        <Card hover={false} style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-tertiary)' }}>
                <th style={cell}>{pt ? 'Distrito' : 'District'}</th>
                <th style={cell}>{pt ? 'Estado' : 'Status'}</th>
                <th style={cell}>{pt ? 'Pros aprovados' : 'Approved pros'}</th>
                <th style={cell}>{pt ? 'Candidaturas' : 'Applications'}</th>
                <th style={cell}>{pt ? 'Lista de espera' : 'Waiting list'}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.key}>
                  <td style={{ ...cell, fontWeight: 600 }}>{pt ? r.labelPT : r.labelEN}</td>
                  <td style={{ ...cell, color: r.open ? 'var(--success)' : 'var(--text-tertiary)' }}>{r.open ? (pt ? 'Aberto' : 'Open') : (pt ? 'Fechado' : 'Closed')}</td>
                  <td style={cell}>{r.pros}</td>
                  <td style={cell}>{r.pendingPros}</td>
                  <td style={cell}>{r.waitlist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
