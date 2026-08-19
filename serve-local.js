const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(process.cwd());
let manifest = { fallback: "index.html", routes: { "/": "index.html" }, spaRoutes: [] };
try { manifest = JSON.parse(fs.readFileSync(path.join(root, "route-manifest.json"), "utf8")); }
catch { /* legacy archive without a route manifest */ }
const types = {
  ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8", ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8", ".png":"image/png", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".webp":"image/webp", ".gif":"image/gif", ".svg":"image/svg+xml",
  ".avif":"image/avif", ".apng":"image/apng", ".bmp":"image/bmp",
  ".ico":"image/x-icon", ".woff":"font/woff", ".woff2":"font/woff2",
  ".woff3":"font/woff", ".eot":"application/vnd.ms-fontobject", ".ttf":"font/ttf", ".otf":"font/otf",
  ".mp3":"audio/mpeg", ".ogg":"audio/ogg", ".m4a":"audio/mp4", ".flac":"audio/flac",
  ".mp4":"video/mp4", ".webm":"video/webm", ".mov":"video/quicktime", ".m4v":"video/mp4", ".3gp":"video/3gpp",
  ".wasm":"application/wasm", ".webmanifest":"application/manifest+json", ".map":"application/json",
  ".xml":"application/xml", ".csv":"text/csv", ".txt":"text/plain", ".pdf":"application/pdf"
};
const assetExtension = /\.(?:css|m?js|cjs|map|json|xml|txt|csv|png|jpe?g|gif|webp|avif|svg|ico|woff[23]?|eot|ttf|otf|mp3|wav|ogg|m4a|flac|mp4|webm|mov|m4v|3gp|wasm|webmanifest|pdf)$/i;
function routeKey(value) {
  let pathname = value;
  try { pathname = decodeURIComponent(pathname); } catch {}
  pathname = ("/" + pathname).replace(/\/{2,}/g, "/");
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
}
function existing(relative) {
  let file = path.resolve(root, String(relative || "index.html").replace(/^\/+/, ""));
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    return fs.statSync(file).isFile() ? file : null;
  } catch { return null; }
}
http.createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method || "GET")) { response.writeHead(405, { Allow: "GET, HEAD" }); return response.end("Method not allowed"); }
  let relative;
  try { relative = decodeURIComponent((request.url || "/").split("?")[0]); }
  catch { response.writeHead(400); return response.end("Bad request"); }
  const key = routeKey(relative);
  let resolution = "exact";
  let file = existing(relative);
  const navigation = !assetExtension.test(key) && /text\/html/i.test(request.headers.accept || "");
  if (!file && navigation && manifest.routes && manifest.routes[key]) { file = existing(manifest.routes[key]); resolution = "captured-route"; }
  if (!file && navigation) { file = existing(manifest.fallback || "index.html"); resolution = "spa-fallback"; }
  if (!file) { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" }); return response.end("Not found"); }
  const stat = fs.statSync(file);
  response.writeHead(200, {
    "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": String(stat.size), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "X-SiteGrabber-Route": resolution
  });
  if (request.method === "HEAD") return response.end();
  fs.createReadStream(file).on("error", () => response.destroy()).pipe(response);
}).listen(4173, "127.0.0.1", () => console.log("Archive: http://127.0.0.1:4173"));
