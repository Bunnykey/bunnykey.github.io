(() => {
  function init() {
    const root = document.getElementById('tag-filter');
    if (!root || root.dataset.initialized) return;
    root.dataset.initialized = 'true';
    const buttons = Array.from(root.querySelectorAll('[data-tag]'));
    const cards = Array.from(document.querySelectorAll('#post-list [data-tags]'));
    const reset = document.getElementById('tag-reset');
    const status = document.getElementById('tag-status');
    const known = new Set(buttons.map(button => button.dataset.tag));
    let active = new Set();
    function update(writeHash = false) {
      if (writeHash) {
        const hash = active.size ? '#' + Array.from(active).map(encodeURIComponent).join(',') : '';
        history.replaceState(history.state, '', location.pathname + location.search + hash);
      }
      buttons.forEach(button => button.setAttribute('aria-pressed', String(active.has(button.dataset.tag))));
      let visible = 0;
      cards.forEach(card => {
        let tags;
        try { tags = JSON.parse(card.dataset.tags); } catch { tags = []; }
        const match = active.size === 0 || tags.some(tag => active.has(tag));
        const item = card.closest('[data-tag-item]') || card;
        item.hidden = !match;
        item.inert = !match;
        if (match) visible++;
      });
      reset.hidden = active.size === 0;
      status.textContent = active.size ? `${cards.length}개 중 ${visible}개 글` : `전체 ${cards.length}개 글`;
    }
    function readHash() {
      let tags;
      try { tags = location.hash.slice(1).split(',').map(decodeURIComponent); } catch { tags = []; }
      active = new Set(tags.filter(tag => known.has(tag)));
      update();
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      const tag = button.dataset.tag;
      if (active.has(tag)) active.delete(tag); else active.add(tag);
      update(true);
    }));
    reset.addEventListener('click', () => { active.clear(); update(true); });
    window.addEventListener('hashchange', readHash);
    document.addEventListener('astro:before-swap', () => window.removeEventListener('hashchange', readHash), {once: true});
    readHash();
    root.hidden = false;
  }
  if (!window.journalTagFilterInitialized) {
    window.journalTagFilterInitialized = true;
    document.addEventListener('astro:page-load', init);
    document.addEventListener('DOMContentLoaded', init);
  }
  if (document.readyState !== 'loading') init();
})();
