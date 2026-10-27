(() => {
  function loadUI() {
    if (window.PagefindUI) return Promise.resolve();
    if (window.journalSearchLoading) return window.journalSearchLoading;
    window.journalSearchLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => { script.remove(); reject(new Error('timeout')); }, 10000);
      script.src = '/pagefind/pagefind-ui.js';
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('load failed')); };
      document.head.append(script);
    }).catch(error => { window.journalSearchLoading = null; throw error; });
    return window.journalSearchLoading;
  }
  async function init() {
    const container = document.getElementById('search');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const status = document.getElementById('search-status');
    const retry = document.getElementById('search-retry');
    async function start() {
      retry.hidden = true;
      status.hidden = false;
      status.textContent = '검색을 준비하고 있어요…';
      try {
        await loadUI();
        if (!container.isConnected) return;
        if (!window.PagefindUI) throw new Error('unavailable');
        container.replaceChildren();
        new window.PagefindUI({element: '#search', showSubResults: true, translations: {placeholder: '검색어를 입력하세요', zero_results: '검색 결과가 없습니다.'}});
        status.hidden = true;
      } catch {
        if (!container.isConnected) return;
        status.textContent = '검색을 불러오지 못했어요. 다시 시도하거나 전체 글에서 찾아보세요.';
        retry.hidden = false;
      }
    }
    retry.addEventListener('click', start);
    await start();
  }
  if (!window.journalSearchInitialized) {
    window.journalSearchInitialized = true;
    document.addEventListener('astro:page-load', init);
    document.addEventListener('DOMContentLoaded', init);
  }
  if (document.readyState !== 'loading') init();
})();
