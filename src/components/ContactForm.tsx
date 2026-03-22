import React, { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.7rem', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'transparent',
  borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
  paddingBottom: '0.5rem', fontSize: '0.875rem',
  color: 'var(--color-on-surface)', outline: 'none',
};

const formStyle: React.CSSProperties = {
  background: 'var(--color-surface-container-lowest)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
};

function SubmitButton({ state }: { state: FormState }) {
  const label = state === 'success' ? 'Message sent!'
    : state === 'submitting' ? 'Sending...'
    : 'Send message';

  return (
    <button
      type="submit"
      disabled={state === 'submitting'}
      style={{
        width: '100%', padding: '0.75rem',
        background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dim))',
        color: 'var(--color-on-primary)', fontSize: '0.875rem', fontWeight: 500,
        borderRadius: '0.375rem', border: 'none',
        cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
        opacity: state === 'submitting' ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {label}
    </button>
  );
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;

    try {
      const res = await fetch(form.action, {
        method: 'POST', body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed');
      setState('success');
      form.reset();
    } catch {
      setState('error');
    }
  }

  return (
    <form action="https://formspree.io/f/FORM_ID" method="POST" onSubmit={handleSubmit} style={formStyle}>
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Name</label>
          <input id="name" type="text" name="name" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" type="email" name="email" required style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="message" style={labelStyle}>Message</label>
        <textarea id="message" name="message" required rows={4} placeholder="Start your message..." style={{ ...inputStyle, resize: 'none' }} />
      </div>

      {state === 'error' && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginBottom: '0.75rem' }}>
          메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.
        </p>
      )}

      <SubmitButton state={state} />
    </form>
  );
}
