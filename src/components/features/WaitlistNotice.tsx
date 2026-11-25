'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { districtLabel } from '@/lib/districts';
import { launchDistrictNames } from '@/lib/launch';

// Shown when someone picks a district Needer is not open in yet (src/lib/launch.ts):
// says so honestly and offers to email them when it opens there.
export default function WaitlistNotice({ district, category, pt, defaultEmail = '' }: {
  district: string;
  category?: string;
  pt: boolean;
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const name = districtLabel(district, pt ? 'pt' : 'en');

  const send = async () => {
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, district, category, locale: pt ? 'pt' : 'en' }),
      });
      if (res.ok) {
        setState('done');
        return;
      }
      setError(res.status === 400
        ? (pt ? 'Verifica o email.' : 'Check the email address.')
        : (pt ? 'Algo correu mal. Tenta mais tarde.' : 'Something went wrong. Try again later.'));
    } catch {
      setError(pt ? 'Algo correu mal. Tenta mais tarde.' : 'Something went wrong. Try again later.');
    }
    setState('idle');
  };

  return (
    <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MapPin size={15} /> {pt ? `Ainda não chegámos a ${name}` : `We are not in ${name} yet`}
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {pt
          ? `Por agora o Needer só funciona em ${launchDistrictNames(true)}, para garantir que cada pedido recebe propostas. Deixa o teu email e avisamos-te quando abrirmos em ${name}.`
          : `For now Needer only works in ${launchDistrictNames(false)}, so that every request gets proposals. Leave your email and we will tell you when we open in ${name}.`}
      </p>
      {state === 'done' ? (
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
          {pt ? 'Combinado! Avisamos-te por email.' : 'Done! We will let you know by email.'}
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={pt ? 'o-teu@email.pt' : 'your@email.com'}
            aria-label="Email"
            style={{ flex: '1 1 200px', padding: '10px 12px', fontSize: '14px', fontFamily: 'var(--font-sans)', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
          />
          <button
            type="button"
            onClick={send}
            disabled={state === 'sending' || !email.includes('@')}
            style={{ padding: '10px 18px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-sans)', cursor: state === 'sending' ? 'wait' : 'pointer', opacity: !email.includes('@') ? 0.6 : 1 }}
          >
            {state === 'sending' ? '…' : pt ? 'Avisem-me' : 'Notify me'}
          </button>
        </div>
      )}
      {error && <p role="alert" style={{ fontSize: '13px', color: 'var(--error)' }}>{error}</p>}
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
        {pt ? 'Só usamos o email para este aviso. Ver Política de Privacidade.' : 'We only use the email for this notice. See the Privacy Policy.'}
      </p>
    </div>
  );
}
