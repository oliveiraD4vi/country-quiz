// Servidor HTTP mínimo para os arquivos do build (dist/), com fallback para o index.html.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

/** Quem pode exibir o app num iframe: o próprio domínio e o portfólio. */
const FRAME_ANCESTORS = process.env.FRAME_ANCESTORS ?? "'self' https://coaladev.com.br https://*.coaladev.com.br http://localhost:*";

export function createStaticServer(root: string) {
  const base = resolve(root);

  async function serve(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end();
      return;
    }
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
      return;
    }
    let path = normalize(join(base, decodeURIComponent(url.pathname)));
    if (path !== base && !path.startsWith(base + sep)) {
      res.writeHead(403).end();
      return;
    }
    let info = await stat(path).catch(() => null);
    if (info?.isDirectory()) {
      path = join(path, "index.html");
      info = await stat(path).catch(() => null);
    }
    // Rotas do app (e arquivos inexistentes sem extensão) caem no index.html.
    if (!info && !extname(path)) {
      path = join(base, "index.html");
      info = await stat(path).catch(() => null);
    }
    if (!info) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const immutable = url.pathname.startsWith("/assets/");
    res.writeHead(200, {
      "Content-Type": TYPES[extname(path)] ?? "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": immutable ? "public, max-age=31536000, immutable" : path.endsWith(".html") ? "no-cache" : "public, max-age=86400",
      "Content-Security-Policy": `frame-ancestors ${FRAME_ANCESTORS}`,
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(path).pipe(res);
  }

  return createServer((req, res) => {
    serve(req, res).catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });
}
