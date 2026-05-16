export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  paragraphsAfter?: string[];
};

export type LegalDoc = {
  title: string;
  sections: LegalSection[];
};

export type LegalMeta = {
  appName: string;
  developerName: string;
  lastUpdated: string;
  effectiveDate: string;
  contact: {
    phone: string;
    phoneDisplay: string;
    email: string;
    whatsapp: string;
  };
  terms: LegalDoc;
  privacy: LegalDoc;
};

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSection(section: LegalSection): string {
  const parts: string[] = [`<section class="legal-section"><h2>${escapeHtml(section.title)}</h2>`];

  for (const p of section.paragraphs ?? []) {
    parts.push(`<p>${escapeHtml(p)}</p>`);
  }

  if (section.bullets?.length) {
    parts.push("<ul>");
    for (const b of section.bullets) {
      parts.push(`<li>${escapeHtml(b)}</li>`);
    }
    parts.push("</ul>");
  }

  for (const p of section.paragraphsAfter ?? []) {
    parts.push(`<p>${escapeHtml(p)}</p>`);
  }

  parts.push("</section>");
  return parts.join("\n");
}

function renderContactBlock(meta: LegalMeta): string {
  const { contact } = meta;
  const tel = contact.phone.replace(/\s/g, "");
  return `
    <div class="contact-card">
      <p><strong>Phone:</strong> <a href="tel:${escapeHtml(tel)}">${escapeHtml(contact.phoneDisplay)}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>
      <p><strong>WhatsApp:</strong> <a href="${escapeHtml(contact.whatsapp)}" rel="noopener noreferrer" target="_blank">Chat on WhatsApp</a></p>
    </div>
  `;
}

export function renderLegalPage(
  meta: LegalMeta,
  doc: LegalDoc,
  slug: "terms" | "privacy",
): string {
  const other =
    slug === "terms"
      ? { href: "/legal/privacy", label: "Privacy Policy" }
      : { href: "/legal/terms", label: "Terms & Conditions" };

  const sectionsHtml = doc.sections
    .map((s, i, arr) => {
      const html = renderSection(s);
      if (i === arr.length - 1) {
        return html + renderContactBlock(meta);
      }
      return html;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(doc.title)} for ${escapeHtml(meta.appName)} — Google Play listing." />
  <title>${escapeHtml(doc.title)} | ${escapeHtml(meta.appName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --brand-blue: #0B2C5F;
      --brand-gold: #C8A951;
      --text: #1f2937;
      --muted: #4b5563;
      --bg: #f3f4f6;
      --card: #ffffff;
      --border: #e5e7eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
    }
    .header {
      background: linear-gradient(135deg, var(--brand-blue) 0%, #123d7a 100%);
      color: #fff;
      padding: 1.25rem 1rem 2rem;
    }
    .header-inner {
      max-width: 720px;
      margin: 0 auto;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .brand-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: var(--brand-blue);
      font-size: 0.85rem;
    }
    .brand h1 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
    }
    .brand p {
      margin: 0.15rem 0 0;
      font-size: 0.8rem;
      opacity: 0.85;
    }
    .page-title {
      margin: 0;
      font-size: clamp(1.5rem, 4vw, 1.85rem);
      font-weight: 700;
    }
    .meta {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }
    main {
      max-width: 720px;
      margin: -1.25rem auto 2.5rem;
      padding: 0 1rem;
    }
    .card {
      background: var(--card);
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 24px rgba(11, 44, 95, 0.08);
      padding: 1.5rem 1.25rem;
    }
    @media (min-width: 640px) {
      .card { padding: 2rem 2rem; }
    }
    .legal-section {
      margin-bottom: 1.75rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .legal-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .legal-section h2 {
      margin: 0 0 0.65rem;
      font-size: 1.05rem;
      color: var(--brand-blue);
    }
    .legal-section p {
      margin: 0 0 0.65rem;
      color: var(--muted);
      font-size: 0.95rem;
    }
    .legal-section ul {
      margin: 0.35rem 0 0.65rem;
      padding-left: 1.25rem;
      color: var(--muted);
      font-size: 0.95rem;
    }
    .legal-section li { margin-bottom: 0.4rem; }
    .contact-card {
      margin-top: 1rem;
      padding: 1rem 1.15rem;
      background: linear-gradient(135deg, rgba(11, 44, 95, 0.06), rgba(200, 169, 81, 0.12));
      border-radius: 12px;
      border: 1px solid rgba(11, 44, 95, 0.12);
    }
    .contact-card p {
      margin: 0.35rem 0;
      color: var(--text);
      font-size: 0.95rem;
    }
    .contact-card a {
      color: var(--brand-blue);
      font-weight: 600;
      text-decoration: none;
    }
    .contact-card a:hover { text-decoration: underline; }
    .footer-nav {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      font-size: 0.9rem;
    }
    .footer-nav a {
      color: var(--brand-blue);
      font-weight: 600;
      text-decoration: none;
    }
    .footer-nav a:hover { text-decoration: underline; }
    .site-footer {
      text-align: center;
      padding: 0 1rem 2rem;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .home-links {
      display: grid;
      gap: 1rem;
    }
    .home-links a {
      display: block;
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      text-decoration: none;
      color: var(--brand-blue);
      font-weight: 700;
      background: #fff;
    }
    .home-links a:hover {
      border-color: var(--brand-gold);
      box-shadow: 0 4px 16px rgba(11, 44, 95, 0.1);
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand">
        <div class="brand-badge" aria-hidden="true">NS</div>
        <div>
          <h1>${escapeHtml(meta.appName)}</h1>
          <p>${escapeHtml(meta.developerName)}</p>
        </div>
      </div>
      <h2 class="page-title">${escapeHtml(doc.title)}</h2>
      <p class="meta">Last updated: ${escapeHtml(meta.lastUpdated)} · Effective: ${escapeHtml(meta.effectiveDate)}</p>
    </div>
  </header>
  <main>
    <article class="card">
      ${sectionsHtml}
      <nav class="footer-nav" aria-label="Legal pages">
        <a href="/legal">Home</a>
        <a href="${other.href}">${escapeHtml(other.label)}</a>
      </nav>
    </article>
  </main>
  <p class="site-footer">© ${new Date().getFullYear()} ${escapeHtml(meta.appName)}. All rights reserved.</p>
</body>
</html>`;
}

export function renderHomePage(meta: LegalMeta): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.appName)} — Legal</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: Inter, sans-serif; margin: 0; background: #f3f4f6; color: #1f2937; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { color: #0B2C5F; }
    .home-links { display: grid; gap: 1rem; margin-top: 1.5rem; }
    .home-links a {
      display: block; padding: 1.25rem; border-radius: 12px; border: 1px solid #e5e7eb;
      text-decoration: none; color: #0B2C5F; font-weight: 700; background: #fff;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(meta.appName)}</h1>
    <p>Public legal documents for Google Play and app users.</p>
    <nav class="home-links">
      <a href="/legal/terms">${escapeHtml(meta.terms.title)}</a>
      <a href="/legal/privacy">${escapeHtml(meta.privacy.title)}</a>
    </nav>
  </div>
</body>
</html>`;
}
