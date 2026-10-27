const routes = new Set(['library', 'import', 'guide']);
export function startRouter(onNavigate) {
  function navigate(focus) {
    const route = location.hash.replace(/^#\/?/, '') || 'library';
    const view = routes.has(route) ? route : 'not-found';
    document.querySelectorAll('main > section').forEach(section => {
      section.hidden = section.id !== `view-${view}`;
    });
    document.querySelectorAll('[data-route]').forEach(link => {
      if (link.dataset.route === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const title = document.querySelector(`#view-${view} h1`).textContent;
    document.title = `${title} · Armok’s Chronicle`;
    if (focus) document.querySelector('#main').focus();
    onNavigate(view);
  }
  window.addEventListener('hashchange', () => navigate(true));
  navigate(false);
}
