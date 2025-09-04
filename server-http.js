// server-http.js
const http = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const isNextAsset = (path) =>
  path === "/" ||
  path.startsWith("/_next/") ||
  path.startsWith("/favicon") ||
  path.startsWith("/icon") ||
  path.startsWith("/manifest") ||
  path.startsWith("/assets/") ||
  path.startsWith("/static/");

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname = "/" } = parsedUrl;

    // allow next assets to be served
    if (isNextAsset(pathname)) {
      return handle(req, res, parsedUrl);
    }

    // handle /i/:userId → render app/i/[userId]/page.tsx
    if (pathname.startsWith("/i/")) {
      const userId = pathname.split("/")[2] || "";
      // route to the dynamic page with userId as query
      return app.render(req, res, "/i/[userId]", { userId });
    }

    // everything else → 404
    return app.render404(req, res, parsedUrl);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> ready on http://localhost:${port}`);
  });
});
