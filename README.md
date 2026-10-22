# Local Explorer returns 403 for hosts allowed by `server.allowedHosts`

Minimal reproduction for `@cloudflare/vite-plugin`: requests to `/cdn-cgi/` (e.g. the Local Explorer UI) are rejected with `403 Invalid Origin header` when the dev server is accessed through a hostname listed in Vite's `server.allowedHosts`.

## Steps

```sh
npm install
npm run dev
```

In a second terminal:

```sh
# The Local Explorer page itself loads
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: my-app.localhost' http://127.0.0.1:5199/cdn-cgi/local/explorer/
# => 200

ASSET=$(curl -s -H 'Host: my-app.localhost' http://127.0.0.1:5199/cdn-cgi/local/explorer/ | grep -o '/cdn-cgi/local/explorer/assets/[^"]*\.js' | head -1)

# Without Origin: OK
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: my-app.localhost' "http://127.0.0.1:5199$ASSET"
# => 200

# With the same-origin Origin header that a browser sends for <script type="module">: rejected
curl -s -w '\n%{http_code}\n' -H 'Host: my-app.localhost' -H 'Origin: http://my-app.localhost' "http://127.0.0.1:5199$ASSET"
# => Invalid Origin header
# => 403
```

In a browser, opening `http://my-app.localhost:5199/cdn-cgi/local/explorer/` shows a blank page, and the console shows `403 (Forbidden)` for the module script.

## Expected

Hostnames allowed by `server.allowedHosts` are also accepted by the `/cdn-cgi/` Host/Origin validation, so the Local Explorer works through them.
