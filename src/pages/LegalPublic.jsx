import React from 'react';
import { Link } from 'react-router-dom';
import LegalDocumentView from '../components/LegalDocumentView';
import { legalMeta } from '../content/legalContent';

export function LegalTermsPublic() {
  return <LegalDocumentView type="terms" />;
}

export function LegalPrivacyPublic() {
  return <LegalDocumentView type="privacy" />;
}

export function LegalHomePublic() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-to-br from-brand-blue to-[#123d7a] text-white px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">{legalMeta.appName}</h1>
          <p className="text-white/85 mt-2 text-sm sm:text-base">
            Public legal documents for Google Play Store and app users.
          </p>
        </div>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/legal/terms"
            className="block p-6 bg-white rounded-2xl border border-gray-100 shadow-premium hover:border-brand-gold/50 transition-colors"
          >
            <p className="font-bold text-brand-blue text-lg">{legalMeta.terms.title}</p>
            <p className="text-sm text-gray-500 mt-2">Terms of use for the mobile app</p>
          </Link>
          <Link
            to="/legal/privacy"
            className="block p-6 bg-white rounded-2xl border border-gray-100 shadow-premium hover:border-brand-gold/50 transition-colors"
          >
            <p className="font-bold text-brand-blue text-lg">{legalMeta.privacy.title}</p>
            <p className="text-sm text-gray-500 mt-2">How we collect and use your data</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
