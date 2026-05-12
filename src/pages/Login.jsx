import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

const Login = ({ authError, clearAuthError }) => {
  const [busy, setBusy] = useState(false);
  const [signInErr, setSignInErr] = useState('');

  const handleGoogleSignIn = async () => {
    clearAuthError?.();
    setSignInErr('');
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setSignInErr(
          `Firebase ne is domain ko allow nahi kiya (Vercel variables se yeh fix nahi hota).\n\n` +
            `Firebase Console → project "next-step-academy-5b9ab" → Authentication → Settings → Authorized domains → Add domain:\n` +
            `${host || 'next-step-admin-pannel.vercel.app'}\n\n` +
            `Save karke 1–2 min baad yahan dubara try karein.`
        );
        return;
      }
      setSignInErr(err?.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100">
        <div className="bg-brand-blue p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex items-center justify-center mx-auto shadow-lg mb-4 ring-1 ring-white/30">
            <img
              src="/next-step-academy-logo.svg"
              alt=""
              className="w-full h-full object-contain scale-[1.02]"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Next Step Academy</h1>
          <p className="text-sm mt-1 text-white/70">Admin — Google sign-in only</p>
        </div>

        <div className="p-8 space-y-6">
          {authError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm px-4 py-3">
              {authError}
            </div>
          ) : null}

          {signInErr ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm px-4 py-3 whitespace-pre-wrap">
              {signInErr}
            </div>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="animate-spin text-brand-blue" size={22} />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
