export const colors = {
  system: '#ef4444',
  skills: '#f59e0b',
  user: '#3b82f6',
  response: '#10b981',
  clipped: '#6b7280',
} as const;

export const demoContainer: React.CSSProperties = {
  background: 'var(--bg-color, #0a0a0a)',
  color: 'var(--text-color, #ededed)',
  border: '1px solid var(--border-color, #262626)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  fontSize: '0.875rem',
};
