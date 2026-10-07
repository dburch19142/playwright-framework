// Minimal app for the sample tests to run against: login, a dashboard, and a JSON API.
// Delete this folder (and the webServer block in playwright.config.ts) once you
// point BASE_URL at your own app.
require('dotenv').config();
const http = require('http');
const crypto = require('crypto');

const PORT = 3100;
const USER = process.env.TEST_USER;
const PASS = process.env.TEST_PASS;

const sessions = new Set();
let items = [{ id: crypto.randomUUID(), name: 'Sample item' }];

const page = (title, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 48px auto; padding: 0 16px; }
    label { display: block; margin: 12px 0 4px; }
    input { padding: 6px; width: 100%; box-sizing: border-box; }
    button { margin-top: 12px; padding: 6px 12px; }
    [role=alert] { color: #b00020; }
  </style>
</head>
<body>${body}</body>
</html>`;

const loginPage = (error) =>
  page(
    'Sign in',
    `<h1>Sign in</h1>
    ${error ? `<p role="alert">${error}</p>` : ''}
    <form method="post" action="/login">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required>
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required>
      <button type="submit">Sign in</button>
    </form>`,
  );

const dashboardPage = () =>
  page(
    'Dashboard',
    `<h1>Dashboard</h1>
    <p data-testid="welcome-banner">Welcome back, ${USER}</p>
    <form id="add-item">
      <label for="item-name">Item name</label>
      <input id="item-name" required>
      <button type="submit">Add item</button>
    </form>
    <ul aria-label="Items"></ul>
    <form method="post" action="/logout"><button type="submit">Sign out</button></form>
    <script>
      const list = document.querySelector('ul');
      async function render() {
        const items = await (await fetch('/api/items')).json();
        list.replaceChildren(...items.map((item) => {
          const li = document.createElement('li');
          li.textContent = item.name;
          return li;
        }));
      }
      document.querySelector('#add-item').addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = document.querySelector('#item-name');
        await fetch('/api/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: input.value }),
        });
        input.value = '';
        await render();
      });
      render();
    </script>`,
  );

const readBody = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
  });

const sessionOf = (req) => /(?:^|;\s*)session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
const isAuthed = (req) => sessions.has(sessionOf(req));

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', ...headers });
  res.end(body);
};
const json = (res, status, body) =>
  send(res, status, JSON.stringify(body), { 'content-type': 'application/json' });
const redirect = (res, location, headers = {}) => send(res, 303, '', { location, ...headers });

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
    const route = `${req.method} ${pathname}`;

    if (route === 'GET /') return redirect(res, isAuthed(req) ? '/dashboard' : '/login');
    if (route === 'GET /login') return send(res, 200, loginPage());

    if (route === 'POST /login') {
      const form = new URLSearchParams(await readBody(req));
      if (form.get('email') !== USER || form.get('password') !== PASS) {
        return send(res, 401, loginPage('Invalid email or password'));
      }
      const token = crypto.randomUUID();
      sessions.add(token);
      return redirect(res, '/dashboard', { 'set-cookie': `session=${token}; HttpOnly; Path=/` });
    }

    if (route === 'POST /logout') {
      sessions.delete(sessionOf(req));
      return redirect(res, '/login', { 'set-cookie': 'session=; Max-Age=0; Path=/' });
    }

    if (route === 'GET /dashboard') {
      return isAuthed(req) ? send(res, 200, dashboardPage()) : redirect(res, '/login');
    }

    if (pathname.startsWith('/api/')) {
      if (!isAuthed(req)) return json(res, 401, { error: 'Unauthorized' });

      if (route === 'GET /api/items') return json(res, 200, items);
      if (route === 'POST /api/items') {
        const { name } = JSON.parse((await readBody(req)) || '{}');
        if (!name) return json(res, 400, { error: 'name is required' });
        const item = { id: crypto.randomUUID(), name };
        items.push(item);
        return json(res, 201, item);
      }
      if (req.method === 'DELETE' && pathname.startsWith('/api/items/')) {
        const id = pathname.split('/').pop();
        items = items.filter((item) => item.id !== id);
        res.writeHead(204);
        return res.end();
      }
    }

    send(res, 404, page('Not found', '<h1>Not found</h1>'));
  })
  .listen(PORT, () => console.log(`Demo app listening on http://localhost:${PORT}`));
