/**
 * Dev health proxy for Expo Metro bundler.
 *
 * Opens the platform's assigned port IMMEDIATELY (so the workflow health
 * check passes), then starts Metro on PORT+1 and proxies all HTTP and
 * WebSocket traffic to it.  The Replit Expo domain tunnel points to PORT,
 * which is forwarded transparently to Metro.
 */

const http = require("http");
const net = require("net");
const { spawn } = require("child_process");

const PORT = parseInt(process.env.PORT || "8099", 10);
const METRO_PORT = PORT + 1;

// ── HTTP proxy ──────────────────────────────────────────────────────────────
function proxyHttp(req, res) {
  const opts = {
    hostname: "127.0.0.1",
    port: METRO_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${METRO_PORT}` },
  };

  const upstream = http.request(opts, (upRes) => {
    res.writeHead(upRes.statusCode, upRes.headers);
    upRes.pipe(res, { end: true });
  });

  upstream.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Expo Metro starting…\n");
    }
  });

  req.pipe(upstream, { end: true });
}

// ── WebSocket / upgrade proxy ───────────────────────────────────────────────
function proxyUpgrade(req, socket, head) {
  const conn = net.connect(METRO_PORT, "127.0.0.1", () => {
    conn.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
        req.rawHeaders
          .reduce((acc, v, i) => (i % 2 === 0 ? acc + v + ": " : acc + v + "\r\n"), "") +
        "\r\n"
    );
    if (head && head.length) conn.write(head);
    conn.pipe(socket);
    socket.pipe(conn);
  });

  conn.on("error", () => socket.destroy());
  socket.on("error", () => conn.destroy());
}

// ── Start proxy server ──────────────────────────────────────────────────────
const server = http.createServer(proxyHttp);
server.on("upgrade", proxyUpgrade);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dev-health] Proxy listening on :${PORT} → Metro on :${METRO_PORT}`);

  // Build the exact environment Metro needs, swapping PORT to METRO_PORT
  const env = { ...process.env, PORT: String(METRO_PORT) };

  // Run without --web so Metro outputs a QR code for Expo Go (iOS/Android).
  // The EXPO_PACKAGER_PROXY_URL env var makes the QR code point to the correct
  // Replit tunnel URL so phones can connect from anywhere.
  console.log("[dev-health] Starting Metro (all platforms + web)…");
  console.log("[dev-health] Scan the QR code below with Expo Go to open on your phone.");

  const metro = spawn(
    "pnpm",
    ["exec", "expo", "start", "--port", String(METRO_PORT)],
    { stdio: "inherit", env }
  );

  metro.on("exit", (code) => {
    console.log(`[dev-health] Metro exited (${code})`);
    server.close();
    process.exit(code ?? 0);
  });

  process.on("SIGTERM", () => {
    metro.kill("SIGTERM");
    server.close(() => process.exit(0));
  });
});
