# Local Explorer returns 403 for hosts that Vite accepts

Minimal reproduction for `@cloudflare/vite-plugin`: requests to `/cdn-cgi/` (e.g. the Local Explorer UI) are rejected with `403 Invalid Origin header` when the dev server is reached through a hostname that Vite accepts but that isn't exactly `localhost` / `127.0.0.1` / `[::1]`:

- `my-app.localhost` (Vite accepts `*.localhost` by default)
- `my-app.test` (listed in `server.allowedHosts`)

## Steps

```sh
npm install
npm run dev
```

In a second terminal:

```sh
for HOST in my-app.localhost my-app.test; do
	ASSET=$(curl -s -H "Host: $HOST" http://127.0.0.1:5199/cdn-cgi/local/explorer/ | grep -o '/cdn-cgi/local/explorer/assets/[^"]*\.js' | head -1)

	# Without Origin: 200
	curl -s -o /dev/null -w "$HOST, no Origin: %{http_code}\n" -H "Host: $HOST" "http://127.0.0.1:5199$ASSET"

	# With the same-origin Origin header that a browser sends for <script type="module">: 403 Invalid Origin header
	curl -s -o /dev/null -w "$HOST, same-origin Origin: %{http_code}\n" -H "Host: $HOST" -H "Origin: http://$HOST" "http://127.0.0.1:5199$ASSET"
done
```

Output:

```
my-app.localhost, no Origin: 200
my-app.localhost, same-origin Origin: 403
my-app.test, no Origin: 200
my-app.test, same-origin Origin: 403
```

In a browser, opening `http://my-app.localhost:5199/cdn-cgi/local/explorer/` shows a blank page, and the console shows `403 (Forbidden)` for the module script.

## Expected

The Local Explorer works through hostnames that Vite accepts.
