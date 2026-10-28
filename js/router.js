const routes = new Set(['library', 'import', 'guide', 'research', 'chronicles']);
export function startRouter(onNavigate,beforeNavigate=()=>true) {
  function navigate(focus) {
    if(focus&&!beforeNavigate())return;
    const raw = location.hash === '#main' ? 'library' : location.hash.replace(/^#\/?/, '') || 'library';
    const [route, query = ''] = raw.split('?');
    const chronicleMatch=route.match(/^chronicle\/([^/]+)$/);
    const religionMatch=route.match(/^world\/([^/]+)\/religion$/);
    const bestiaryMatch=route.match(/^world\/([^/]+)\/bestiary$/);
    const artifactsMatch=route.match(/^world\/([^/]+)\/artifacts$/);
    const grudgeMatch=route.match(/^world\/([^/]+)\/grudges$/);
    const deskMatch=route.match(/^world\/([^/]+)\/desk$/);
    const factionMatch=route.match(/^world\/([^/]+)\/factions\/([^/]+)\/warfare$/);
    const warfareMatch=route.match(/^world\/([^/]+)\/wars$/);
    const bookMatch=route.match(/^world\/([^/]+)\/records$/);
    const atlasMatch=route.match(/^world\/([^/]+)\/atlas$/);
    const recordMatch = route.match(/^world\/([^/]+)\/record\/([^/]+)\/([^/]+)$/);
    const worldMatch = route.match(/^world\/([^/]+)$/);
    const view = chronicleMatch ? 'chronicle' : religionMatch ? 'religion' : bestiaryMatch ? 'bestiary' : artifactsMatch ? 'artifacts' : grudgeMatch ? 'grudges' : deskMatch ? 'desk' : factionMatch ? 'faction' : warfareMatch ? 'warfare' : bookMatch ? 'book' : atlasMatch ? 'atlas' : recordMatch ? 'record' : worldMatch ? 'world' : routes.has(route) ? route : 'not-found';
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
    let parts;try{parts=(chronicleMatch||religionMatch||bestiaryMatch||artifactsMatch||grudgeMatch||deskMatch||factionMatch||warfareMatch||bookMatch||atlasMatch||recordMatch||worldMatch)?.slice(1).map(decodeURIComponent)||[];}catch{parts=[];}
    onNavigate(view, parts, new URLSearchParams(query));
  }
  window.addEventListener('hashchange', () => navigate(true));
  navigate(false);
}
