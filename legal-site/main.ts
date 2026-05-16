import { renderHomePage, renderLegalPage, type LegalMeta } from "./render.ts";

const contentPath = new URL("../shared/legalContent.json", import.meta.url);
const meta = JSON.parse(await Deno.readTextFile(contentPath)) as LegalMeta;

const PORT = Number(Deno.env.get("PORT") ?? "8787");

const ROUTES: Record<string, () => string> = {
  "/": () => renderHomePage(meta),
  "/terms": () => renderLegalPage(meta, meta.terms, "terms"),
  "/terms-and-conditions": () => renderLegalPage(meta, meta.terms, "terms"),
  "/privacy": () => renderLegalPage(meta, meta.privacy, "privacy"),
  "/privacy-policy": () => renderLegalPage(meta, meta.privacy, "privacy"),
};

function handler(req: Request): Response {
  const url = new URL(req.url);
  let path = url.pathname.replace(/\/+$/, "") || "/";

  const html = ROUTES[path];
  if (!html) {
    return new Response("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(html(), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
      "access-control-allow-origin": "*",
    },
  });
}

console.log(`NEXTSTEP Academy legal site → http://localhost:${PORT}`);
console.log(`  Terms:   http://localhost:${PORT}/terms`);
console.log(`  Privacy: http://localhost:${PORT}/privacy`);
console.log(`Deploy on Deno Deploy with subdomain e.g. legal.your-admin-domain.com`);

Deno.serve({ port: PORT }, handler);
