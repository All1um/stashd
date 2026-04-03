import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail;
    const { error: authError } = await fn(form.email, form.password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
    }
    // On success, AuthContext updates → Home.jsx re-renders → StashdApp shown
  };

  const handleGoogle = async () => {
    setError('');
    const { error: authError } = await signInWithGoogle();
    if (authError) setError(authError.message);
  };

  return (
    <div className="min-h-screen flex flex-col px-6" style={{
      background: '#0A0A0A',
      paddingTop: 'max(60px, env(safe-area-inset-top, 60px))',
      paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))',
    }}>

      {/* Radial gold glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.09) 0%, transparent 70%)',
          filter: 'blur(48px)',
        }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">

        {/* Wordmark */}
        <p style={{
          color: '#D4A853',
          fontSize: '11px',
          fontFamily: 'DM Mono, monospace',
          fontWeight: 500,
          letterSpacing: '0.18em',
          marginBottom: '48px',
        }}>
          STASHD
        </p>

        {/* Mode toggle */}
        <div className="flex gap-6 mb-8">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              style={{
                color: mode === m ? '#F5F0E8' : '#6B6B6B',
                fontFamily: 'Inter',
                fontSize: '15px',
                fontWeight: mode === m ? 600 : 400,
                paddingBottom: '6px',
                borderBottom: mode === m ? '1.5px solid #D4A853' : '1.5px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Headline */}
        <h1 className="mb-2" style={{
          color: '#F5F0E8',
          fontSize: '34px',
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          lineHeight: 1.2,
        }}>
          {mode === 'signin' ? 'Secure Your\nStash.' : 'Join Stashd.'}
        </h1>
        <p className="mb-10" style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter', lineHeight: 1.6 }}>
          {mode === 'signin'
            ? 'Sign in to access your wishlists and price alerts.'
            : 'Save products. Track prices. Buy smarter.'}
        </p>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <p style={{
              color: '#6B6B6B',
              fontSize: '10px',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.14em',
              marginBottom: '8px',
            }}>
              EMAIL ADDRESS
            </p>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              className="w-full px-4 py-4 rounded-2xl outline-none"
              style={{
                background: '#141414',
                border: '1px solid #1E1E1E',
                color: '#F5F0E8',
                fontFamily: 'Inter',
                fontSize: '15px',
              }}
            />
          </div>

          <div>
            <p style={{
              color: '#6B6B6B',
              fontSize: '10px',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.14em',
              marginBottom: '8px',
            }}>
              PASSWORD
            </p>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              className="w-full px-4 py-4 rounded-2xl outline-none"
              style={{
                background: '#141414',
                border: '1px solid #1E1E1E',
                color: '#F5F0E8',
                fontFamily: 'Inter',
                fontSize: '15px',
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4" style={{ color: '#E74C3C', fontSize: '13px', fontFamily: 'Inter', lineHeight: 1.5 }}>
            {error}
          </p>
        )}

        {/* Gold Continue CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mb-4 transition-opacity active:opacity-80 disabled:opacity-50"
          style={{
            background: loading ? 'rgba(212,168,83,0.6)' : '#D4A853',
            color: '#0A0A0A',
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '15px',
          }}
        >
          {loading ? (
            <svg width="18" height="18" viewBox="0 0 18 18" className="animate-spin">
              <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(10,10,10,0.3)" strokeWidth="2" />
              <circle cx="9" cy="9" r="7" fill="none" stroke="#0A0A0A" strokeWidth="2"
                strokeLinecap="round" strokeDasharray="33 10" />
            </svg>
          ) : (
            <>
              Continue
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: '#1E1E1E' }} />
          <span style={{ color: '#6B6B6B', fontSize: '12px', fontFamily: 'Inter' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#1E1E1E' }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 mb-8 transition-opacity active:opacity-70"
          style={{
            background: '#141414',
            border: '1px solid #1E1E1E',
            color: '#F5F0E8',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '15px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Mode switch */}
        <button
          type="button"
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }}
          className="text-center w-full mt-auto"
          style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter' }}
        >
          {mode === 'signin'
            ? <span>No account yet?&nbsp;<span style={{ color: '#D4A853', fontWeight: 600 }}>Sign Up</span></span>
            : <span>Already have an account?&nbsp;<span style={{ color: '#D4A853', fontWeight: 600 }}>Sign In</span></span>
          }
        </button>

      </div>
    </div>
  );
}
