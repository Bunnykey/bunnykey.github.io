(() => {
  if (window.journalThemeInitialized) return;
  window.journalThemeInitialized = true;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark', 'system'].includes(value);
  let preference = 'system';
  try {
    const saved = localStorage.getItem('reading-theme');
    if (valid(saved)) preference = saved;
  } catch {}
  const resolved = () => preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  function apply(doc = document) {
    const theme = resolved();
    doc.documentElement.dataset.theme = theme;
    doc.documentElement.style.colorScheme = theme;
    doc.getElementById('meta-theme-color')?.setAttribute('content', theme === 'dark' ? '#191919' : '#fafafa');
    doc.querySelectorAll('input[name="reading-theme"]').forEach(input => { input.checked = input.value === preference; });
  }
  function close(restoreFocus = false) {
    const picker = document.getElementById('theme-picker');
    if (!picker?.open) return;
    picker.open = false;
    if (restoreFocus) picker.querySelector('summary')?.focus();
  }
  document.addEventListener('change', event => {
    if (!event.target.matches('input[name="reading-theme"]') || !valid(event.target.value)) return;
    preference = event.target.value;
    try { localStorage.setItem('reading-theme', preference); } catch {}
    apply();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
  document.addEventListener('click', event => { if (!event.target.closest('#theme-picker')) close(); });
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== 'reading-theme' && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : 'system';
    apply();
  });
  document.addEventListener('astro:before-swap', event => { close(); apply(event.newDocument); });
  document.addEventListener('astro:page-load', () => apply());
  document.addEventListener('DOMContentLoaded', () => apply());
  apply();
})();
