import React from 'react';
import { legalMeta } from '../content/legalContent';

function LegalSection({ section, showContact }) {
  return (
    <section className="mb-7 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <h2 className="text-base sm:text-lg font-bold text-brand-blue mb-3">{section.title}</h2>
      {(section.paragraphs || []).map((p) => (
        <p key={p.slice(0, 40)} className="text-gray-600 text-sm sm:text-[15px] leading-relaxed mb-3">
          {p}
        </p>
      ))}
      {section.bullets?.length > 0 && (
        <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm sm:text-[15px]">
          {section.bullets.map((b) => (
            <li key={b.slice(0, 48)}>{b}</li>
          ))}
        </ul>
      )}
      {(section.paragraphsAfter || []).map((p) => (
        <p key={p.slice(0, 40)} className="text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-3 mb-3">
          {p}
        </p>
      ))}
      {showContact && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-brand-blue/5 to-brand-gold/10 border border-brand-blue/10">
          <p className="text-sm text-gray-800">
            <strong>Phone:</strong>{' '}
            <a className="text-brand-blue font-semibold" href={`tel:${legalMeta.contact.phone.replace(/\s/g, '')}`}>
              {legalMeta.contact.phoneDisplay}
            </a>
          </p>
          <p className="text-sm text-gray-800 mt-2">
            <strong>Email:</strong>{' '}
            <a className="text-brand-blue font-semibold" href={`mailto:${legalMeta.contact.email}`}>
              {legalMeta.contact.email}
            </a>
          </p>
          <p className="text-sm text-gray-800 mt-2">
            <strong>WhatsApp:</strong>{' '}
            <a
              className="text-brand-blue font-semibold"
              href={legalMeta.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </p>
        </div>
      )}
    </section>
  );
}

export default function LegalDocumentView({ type }) {
  const doc = type === 'terms' ? legalMeta.terms : legalMeta.privacy;
  const other = type === 'terms' ? '/legal/privacy' : '/legal/terms';
  const otherLabel = type === 'terms' ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-br from-brand-blue to-[#123d7a] text-white px-4 sm:px-6 pt-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-brand-blue font-extrabold text-sm shadow-md">
              NS
            </div>
            <div>
              <p className="font-bold text-base sm:text-lg">{legalMeta.appName}</p>
              <p className="text-white/80 text-xs sm:text-sm">{legalMeta.developerName}</p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{doc.title}</h1>
          <p className="text-white/85 text-sm mt-2">
            Last updated: {legalMeta.lastUpdated} · Effective: {legalMeta.effectiveDate}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 pb-12">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-premium p-5 sm:p-8">
          {doc.sections.map((section, index) => (
            <LegalSection
              key={section.title}
              section={section}
              showContact={index === doc.sections.length - 1}
            />
          ))}
          <nav className="flex flex-wrap gap-4 pt-6 mt-2 border-t border-gray-100 text-sm font-semibold">
            <a href="/legal" className="text-brand-blue hover:underline">
              Legal home
            </a>
            <a href={other} className="text-brand-blue hover:underline">
              {otherLabel}
            </a>
          </nav>
        </article>
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} {legalMeta.appName}. All rights reserved.
        </p>
      </main>
    </div>
  );
}
