import React, { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

function SubmitButton({ state }: { state: FormState }) {
  const label = state === 'success' ? 'Message sent!'
    : state === 'submitting' ? 'Sending...'
    : 'Send message';

  return (
    <button
      type="submit"
      disabled={state === 'submitting'}
      className="w-full py-3 bg-accent text-surface text-sm font-medium rounded-md transition-opacity disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
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
    <form action="https://formspree.io/f/mbdzepdo" method="POST" onSubmit={handleSubmit} className="bg-surface rounded-xl p-6">
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-[0.7rem] font-medium uppercase tracking-widest text-foreground-muted mb-2">Name</label>
          <input id="name" type="text" name="name" required aria-required="true" className="w-full bg-transparent border-b border-outline-subtle/30 pb-2 text-sm text-foreground outline-none focus:border-accent transition-all duration-300" />
        </div>
        <div>
          <label htmlFor="email" className="block text-[0.7rem] font-medium uppercase tracking-widest text-foreground-muted mb-2">Email</label>
          <input id="email" type="email" name="email" required aria-required="true" className="w-full bg-transparent border-b border-outline-subtle/30 pb-2 text-sm text-foreground outline-none focus:border-accent transition-all duration-300" />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="message" className="block text-[0.7rem] font-medium uppercase tracking-widest text-foreground-muted mb-2">Message</label>
        <textarea id="message" name="message" required aria-required="true" rows={4} placeholder="Start your message..." className="w-full bg-transparent border-b border-outline-subtle/30 pb-2 text-sm text-foreground outline-none focus:border-accent transition-all duration-300 resize-none" />
      </div>

      {state === 'error' && (
        <p id="form-error" className="text-xs text-error mb-3" role="alert">
          메시지 전송에 실패했습니다. 이메일로 직접 연락해주세요.
        </p>
      )}

      {state === 'success' && (
        <p className="text-xs text-accent mb-3" role="status">
          메시지가 전송되었습니다. 감사합니다!
        </p>
      )}

      <SubmitButton state={state} />
    </form>
  );
}
