import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const meta = JSON.parse(readFileSync(join(root, 'shared/legalContent.json'), 'utf8'));

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderSection(section) {
  const parts = [`<section class="legal-section"><h2>${escapeHtml(section.title)}</h2>`];
  for (const p of section.paragraphs ?? []) parts.push(`<p>${escapeHtml(p)}</p>`);
  if (section.bullets?.length) {
    parts.push('<ul>');
    for (const b of section.bullets) parts.push(`<li>${escapeHtml(b)}</li>`);
    parts.push('</ul>');
  }
  for (const p of section.paragraphsAfter ?? []) parts.push(`<p>${escapeHtml(p)}</p>`);
  parts.push('</section>');
  return parts.join('\n');
}

function renderContact() {
  const { contact } = meta;
  const tel = contact.phone.replace(/\s/g, '');
  return `<div class="contact-card">
      <p><strong>Phone:</strong> <a href="tel:${escapeHtml(tel)}">${escapeHtml(contact.phoneDisplay)}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>
      <p><strong>WhatsApp:</strong> <a href="${escapeHtml(contact.whatsapp)}" rel="noopener noreferrer" target="_blank">Chat on WhatsApp</a></p>
    </div>`;
}

function renderLegalPage(doc, slug) {
  const other =
    slug === 'terms'
      ? { href: '/legal/privacy', label: 'Privacy Policy' }
      : { href: '/legal/terms', label: 'Terms & Conditions' };

  const sectionsHtml = doc.sections
    .map((s, i, arr) => {
      const html = renderSection(s);
      return i === arr.length - 1 ? html + renderContact() : html;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(doc.title)} for ${escapeHtml(meta.appName)}." />
  <title>${escapeHtml(doc.title)} | ${escapeHtml(meta.appName)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root { --brand-blue: #0B2C5F; --text: #1f2937; --muted: #4b5563; --bg: #f3f4f6; --card: #fff; --border: #e5e7eb; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; }
    .header { background: linear-gradient(135deg, var(--brand-blue), #123d7a); color: #fff; padding: 1.25rem 1rem 2rem; }
    .header-inner, main { max-width: 720px; margin: 0 auto; }
    .brand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .brand-badge { width: 44px; height: 44px; border-radius: 12px; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--brand-blue); }
    .page-title { margin: 0; font-size: clamp(1.5rem, 4vw, 1.85rem); }
    .meta { margin-top: 0.5rem; font-size: 0.875rem; opacity: 0.9; }
    main { padding: 0 1rem; margin-top: -1.25rem; margin-bottom: 2.5rem; }
    .card { background: var(--card); border-radius: 16px; border: 1px solid var(--border); padding: 1.5rem 1.25rem; box-shadow: 0 4px 24px rgba(11,44,95,.08); }
    @media (min-width: 640px) { .card { padding: 2rem; } }
    .legal-section { margin-bottom: 1.75rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
    .legal-section:last-of-type { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
    .legal-section h2 { margin: 0 0 0.65rem; font-size: 1.05rem; color: var(--brand-blue); }
    .legal-section p, .legal-section li { color: var(--muted); font-size: 0.95rem; }
    .contact-card { margin-top: 1rem; padding: 1rem; border-radius: 12px; background: linear-gradient(135deg, rgba(11,44,95,.06), rgba(200,169,81,.12)); border: 1px solid rgba(11,44,95,.12); }
    .contact-card a { color: var(--brand-blue); font-weight: 600; }
    .footer-nav { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: 1rem; }
    .footer-nav a { color: var(--brand-blue); font-weight: 600; text-decoration: none; }
    .site-footer { text-align: center; padding: 0 1rem 2rem; font-size: 0.8rem; color: var(--muted); }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand">
        <div class="brand-badge">NS</div>
        <div>
          <h1 style="margin:0;font-size:1.15rem">${escapeHtml(meta.appName)}</h1>
          <p style="margin:.15rem 0 0;font-size:.8rem;opacity:.85">${escapeHtml(meta.developerName)}</p>
        </div>
      </div>
      <h2 class="page-title">${escapeHtml(doc.title)}</h2>
      <p class="meta">Last updated: ${escapeHtml(meta.lastUpdated)} · Effective: ${escapeHtml(meta.effectiveDate)}</p>
    </div>
  </header>
  <main>
    <article class="card">${sectionsHtml}
      <nav class="footer-nav">
        <a href="/legal">Home</a>
        <a href="${other.href}">${escapeHtml(other.label)}</a>
      </nav>
    </article>
  </main>
  <p class="site-footer">© ${new Date().getFullYear()} ${escapeHtml(meta.appName)}</p>
</body>
</html>`;
}

function writePage(relativeDir, html) {
  const dir = join(root, 'public', relativeDir);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, 'index.html');
  writeFileSync(out, html, 'utf8');
  console.log('Generated', out);
}

writePage('legal/privacy', renderLegalPage(meta.privacy, 'privacy'));
writePage('legal/terms', renderLegalPage(meta.terms, 'terms'));
