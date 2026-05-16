import React, { useMemo, useState } from 'react';
import { ExternalLink, Copy, CheckCircle2, FileText, Shield, Globe } from 'lucide-react';
import { getLegalPublicBaseUrl, getLegalUrls, legalMeta } from '../content/legalContent';

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this URL:', text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      title={`Copy ${label}`}
    >
      {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function UrlCard({ title, description, url, icon: Icon }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <code className="flex-1 text-xs sm:text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 break-all text-brand-blue font-medium">
          {url}
        </code>
        <div className="flex gap-2 shrink-0">
          <CopyButton text={url} label={title} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90"
          >
            <ExternalLink size={16} />
            Open
          </a>
        </div>
      </div>
    </div>
  );
}

const LegalDocs = () => {
  const urls = useMemo(() => getLegalUrls(), []);
  const publicBase = getLegalPublicBaseUrl();

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Legal & Google Play</h1>
        <p className="text-gray-500 mt-1">
          Public Terms & Privacy pages for Google Play Console. Use the URLs below in your store listing.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
        <p className="font-bold mb-1">Google Play requirement</p>
        <p>
          Privacy Policy URL must be publicly accessible without login. Use the links below on{' '}
          <strong>nextstepacademy.online</strong> after you deploy the admin panel build.
        </p>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white border border-gray-100 flex items-center gap-3">
          <Globe className="text-brand-blue shrink-0" size={22} />
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Public base URL</p>
            <p className="font-semibold text-gray-800 break-all">{publicBase}</p>
            <p className="text-xs text-gray-500 mt-1">
              Legal pages path: <code className="text-brand-blue">/legal/privacy</code>,{' '}
              <code className="text-brand-blue">/legal/terms</code>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Last updated: <strong>{legalMeta.lastUpdated}</strong> · Contact: {legalMeta.contact.phoneDisplay},{' '}
          {legalMeta.contact.email}
        </p>
      </div>

      <div className="space-y-4 mb-10">
        <UrlCard
          title="Privacy Policy (required for Play Store)"
          description="Paste this in Google Play Console → App content → Privacy policy"
          url={urls.privacy}
          icon={Shield}
        />
        <UrlCard
          title="Terms & Conditions"
          description="Optional in Play Console; recommended for educational apps"
          url={urls.terms}
          icon={FileText}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-premium overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Open live pages</h2>
          <p className="text-sm text-gray-500 mt-1">
            Opens the public pages on nextstepacademy.online (mobile and desktop friendly).
          </p>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          <a
            href={urls.terms}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 text-brand-blue font-bold hover:border-brand-gold hover:bg-brand-gold/5"
          >
            <FileText size={18} />
            Open Terms
          </a>
          <a
            href={urls.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 text-brand-blue font-bold hover:border-brand-gold hover:bg-brand-gold/5"
          >
            <Shield size={18} />
            Open Privacy
          </a>
        </div>
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
        <p className="font-bold text-gray-800 mb-2">Deploy note</p>
        <p>
          Host the admin panel on <strong>nextstepacademy.online</strong> with SPA fallback so{' '}
          <code>/legal/privacy</code> and <code>/legal/terms</code> open directly (see{' '}
          <code>public/_redirects</code>).
        </p>
      </div>
    </div>
  );
};

export default LegalDocs;
