/* Browser preferences and modal behavior shared by both archives. */
(() => {
  let theme = 'system';
  try {
    theme = localStorage.getItem('archive.theme') || localStorage.getItem('rachel.theme') || 'system';
  } catch { /* Preferences remain usable for this visit. */ }
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  document.addEventListener('DOMContentLoaded', () => {
    const appearance = document.querySelector('#appearance');
    if (appearance) {
      appearance.value = ['light', 'dark'].includes(theme) ? theme : 'system';
      appearance.addEventListener('change', () => {
        if (appearance.value === 'system') delete document.documentElement.dataset.theme;
        else document.documentElement.dataset.theme = appearance.value;
        try { localStorage.setItem('archive.theme', appearance.value); }
        catch { const status = document.querySelector('#appearance-status'); if (status) status.textContent = 'This appearance applies to this visit only.'; }
      });
    }
    document.querySelectorAll('.to-top').forEach(button => button.addEventListener('click', () => {
      window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      document.querySelector('.brand')?.focus({preventScroll: true});
    }));
    const header = document.querySelector('.top, .topbar');
    if (header) new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`)).observe(header);
    const dialogs = [...document.querySelectorAll('[role=dialog]')];
    const originalInert = new Map();
    let active = null;
    function syncDialogs() {
      for (const [node, value] of originalInert) node.inert = value;
      originalInert.clear();
      const visible = dialogs.filter(dialog => !dialog.hidden && dialog.getClientRects().length && (!document.body.classList.contains('rachel-site') || dialog.classList.contains('on')));
      active = visible.find(dialog => dialog.classList.contains('lightbox')) || visible.at(-1) || null;
      document.body.classList.toggle('modal-open', Boolean(active));
      if (!active) return;
      for (const node of document.body.children) {
        if (node === active || node.contains(active) || ['SCRIPT', 'STYLE', 'LINK'].includes(node.tagName)) continue;
        originalInert.set(node, node.inert);
        node.inert = true;
      }
    }
    const observer = new MutationObserver(syncDialogs);
    dialogs.forEach(dialog => observer.observe(dialog, {attributes: true, attributeFilter: ['hidden', 'class']}));
    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.key !== 'Tab' || !active) return;
      const controls = [...active.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (!active.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    syncDialogs();
  });
})();
