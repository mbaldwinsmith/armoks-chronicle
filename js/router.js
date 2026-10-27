const routes = new Set(['library', 'import', 'guide']);
export function startRouter(onNavigate) {
  function navigate(focus) {
    const raw = location.hash === '#main' ? 'library' : location.hash.replace(/^#\/?/, '') || 'library';
    const [route, query = ''] = raw.split('?');
    const atlasMatch=route.match(/^world\/([^/]+)\/atlas$/);
    const recordMatch = route.match(/^world\/([^/]+)\/record\/([^/]+)\/([^/]+)$/);
    const worldMatch = route.match(/^world\/([^/]+)$/);
    const view = atlasMatch ? 'atlas' : recordMatch ? 'record' : worldMatch ? 'world' : routes.has(route) ? route : 'not-found';
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
    let parts;try{parts=(atlasMatch||recordMatch||worldMatch)?.slice(1).map(decodeURIComponent)||[];}catch{parts=[];}
    onNavigate(view, parts, new URLSearchParams(query));
  }
  window.addEventListener('hashchange', () => navigate(true));
  navigate(false);
}
