const routes = {};
let notFoundHandler = () => {};

export function registerRoute(name, handler) {
  routes[name] = handler;
}
export function setNotFound(handler) { notFoundHandler = handler; }

export function currentRouteInfo() {
  const hash = location.hash.replace(/^#\//, '');
  const [path, query] = hash.split('?');
  const [name, param] = path.split('/');
  const params = new URLSearchParams(query || '');
  return { name: name || 'dashboard', param, params };
}

export function navigate(path) {
  location.hash = `#/${path}`;
}

export function startRouter(onChange) {
  const handle = () => {
    const info = currentRouteInfo();
    const handler = routes[info.name] || notFoundHandler;
    onChange(info);
    handler(info);
  };
  window.addEventListener('hashchange', handle);
  handle();
}
