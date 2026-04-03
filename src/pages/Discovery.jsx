import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { toastInfo } from '@/lib/toast';
import { meiFromPrices } from '@/utils/marketLogic';

// ── Gold spinner ──────────────────────────────────────────

function GoldSpinner({ size = 24 }) {
  const r    = size / 2 - 3;
  const c    = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="animate-spin">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#2E2E2E"  strokeWidth="2.5" />
      <circle cx={c} cy={c} r={r} fill="none" stroke="#D4A853" strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${circ * 0.72} ${circ * 0.28}`} />
    </svg>
  );
}

// ── Currency formatter ────────────────────────────────────

const CURRENCY_SYMBOL = { CAD: 'CA$', USD: '$', GBP: '£', EUR: '€', AUD: 'A$' };
function fmt(price, currency) {
  const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  return `${sym}${Number(price).toFixed(2)}`;
}

// ── Question detection ────────────────────────────────────

const QUESTION_WORDS = /^(what|which|who|how|is|are|should|best|recommend|compare|vs|versus)/i;

function isQuestion(q) {
  return q.endsWith('?') || QUESTION_WORDS.test(q.trim());
}

// ── Gemini AI Box ─────────────────────────────────────────

function GeminiAIBox({ advice, question }) {
  if (!advice) return null;
  const label = question ? '✦ AI RECOMMENDATION' : '✦ AI INSIGHT';
  return (
    <div className="mb-4 px-4 py-4 rounded-2xl" style={{
      background: '#000000',
      border: `1px solid ${question ? 'rgba(212,168,83,0.55)' : 'rgba(212,168,83,0.35)'}`,
    }}>
      <span style={{
        display: 'block',
        color: '#D4A853',
        fontSize: '9px',
        fontFamily: 'DM Mono, monospace',
        letterSpacing: '0.14em',
        fontWeight: 600,
        marginBottom: '8px',
      }}>
        {label}
      </span>
      <p style={{ color: '#F5F0E8', fontSize: question ? '15px' : '14px', fontFamily: 'Inter', lineHeight: 1.7 }}>
        {advice}
      </p>
    </div>
  );
}

// ── MEI Badge ─────────────────────────────────────────────

function MEIBadge({ mei }) {
  if (!mei) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1 mb-2">
      <span style={{
        color: '#6B6B6B',
        fontSize: '8px',
        fontFamily: 'DM Mono, monospace',
        letterSpacing: '0.1em',
      }}>
        MEI
      </span>
      <span style={{
        color: mei.color,
        fontSize: '8px',
        fontFamily: 'DM Mono, monospace',
        fontWeight: 600,
        letterSpacing: '0.08em',
      }}>
        {mei.score} · {mei.label.toUpperCase()}
      </span>
    </div>
  );
}

// ── Product result card ───────────────────────────────────

function ProductCard({ result, currency, onStash }) {
  const [imgError, setImgError] = useState(false);
  const cardUrl = result.product_url || result.link || null;

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#141414', border: '1px solid #1E1E1E' }}>

      {/* Image — clickable link to product page */}
      {cardUrl ? (
        <a
          href={cardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ paddingTop: '100%', background: '#1E1E1E', display: 'block' }}
        >
          {!imgError && result.image_url ? (
            <img
              src={result.image_url}
              alt={result.title}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Search size={24} color="#2E2E2E" />
            </div>
          )}
          {result.is_best && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(46,204,113,0.15)',
                border: '1px solid #2ECC71',
                color: '#2ECC71',
                fontSize: '9px',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em',
              }}>
              BEST
            </span>
          )}
        </a>
      ) : (
        <div className="relative" style={{ paddingTop: '100%', background: '#1E1E1E' }}>
          {!imgError && result.image_url ? (
            <img
              src={result.image_url}
              alt={result.title}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Search size={24} color="#2E2E2E" />
            </div>
          )}
          {result.is_best && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(46,204,113,0.15)',
                border: '1px solid #2ECC71',
                color: '#2ECC71',
                fontSize: '9px',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em',
              }}>
              BEST
            </span>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="mb-1" style={{
          color: '#F5F0E8',
          fontSize: '12px',
          fontFamily: 'Inter',
          fontWeight: 500,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {result.title}
        </p>

        <span style={{
          background: 'rgba(212,168,83,0.1)',
          color: '#D4A853',
          fontSize: '9px',
          padding: '2px 6px',
          borderRadius: '9999px',
          fontFamily: 'Inter',
          fontWeight: 500,
          display: 'inline-block',
          alignSelf: 'flex-start',
          marginBottom: '2px',
        }}>
          {result.store}
        </span>

        <MEIBadge mei={result.mei} />

        <p className="mt-auto" style={{
          color: '#D4A853',
          fontSize: '15px',
          fontFamily: 'DM Mono, monospace',
          fontWeight: 500,
        }}>
          {fmt(result.price, currency)}
        </p>

        <button
          type="button"
          onClick={() => onStash(result)}
          className="mt-2 w-full py-2 rounded-xl transition-opacity active:opacity-70"
          style={{
            background: 'rgba(232,101,43,0.12)',
            border: '1px solid rgba(232,101,43,0.3)',
            color: '#E8652B',
            fontSize: '11px',
            fontFamily: 'Inter',
            fontWeight: 600,
          }}
        >
          + Stash
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function Discovery({ onStash }) {
  const { user, profile } = useAuth();
  const { country_code = 'CA', currency = 'CAD' } = profile ?? {};

  const [query,        setQuery]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [results,      setResults]      = useState(null);
  const [geminiAdvice, setGeminiAdvice] = useState('');
  const [searchError,  setSearchError]  = useState('');
  const inputRef = useRef(null);

  const handleSearch = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearchError('');
    setResults(null);
    setGeminiAdvice('');

    // Hardcode Vancouver/CA region for precise national retailer results
    const { data, error } = await supabase.functions.invoke('discover-products', {
      body: { query: trimmed, country_code: 'CA', currency },
    });

    setLoading(false);

    if (error || data?.error) {
      setSearchError('Search unavailable. Please try again.');
      return;
    }

    // Compute MEI from price range across all results
    const raw = data.shoppingResults ?? [];
    if (raw.length > 1) {
      const prices    = raw.map((r) => r.price);
      const low90     = Math.min(...prices);
      const high90    = Math.max(...prices);
      const withMEI   = raw.map((r) => ({ ...r, mei: meiFromPrices(r.price, [low90, high90]) }));
      setResults(withMEI);
    } else {
      setResults(raw);
    }

    setGeminiAdvice(data.geminiAdvice ?? '');
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setGeminiAdvice('');
    setSearchError('');
    inputRef.current?.focus();
  };

  const handleStash = (result) => {
    if (!user) {
      toastInfo('Sign in required', 'Create an account to stash products.');
      return;
    }
    if (onStash) onStash(result);
  };

  return (
    <div className="min-h-screen" style={{
      background: '#000000',
      paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
    }}>

      {/* Radial glow */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '280px', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <div className="relative z-10 px-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{ color: '#F5F0E8', fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Discover
            </h1>
            <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginTop: '2px' }}>
              {currency}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4A853, #E8652B)' }}>
            <span style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600 }}>
              {(profile?.display_name ?? user?.email ?? 'U')[0].toUpperCase()}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4"
          style={{ background: '#141414', border: '1px solid #1E1E1E' }}>
          <Search size={16} color="#6B6B6B" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search products, brands..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: '#F5F0E8', fontFamily: 'Inter', fontSize: '15px' }}
          />
          {loading && <GoldSpinner size={20} />}
          {!loading && query && (
            <button type="button" onClick={handleClear}>
              <X size={16} color="#6B6B6B" />
            </button>
          )}
        </div>

        {/* Search CTA */}
        {query.trim() && !loading && (
          <button
            type="button"
            onClick={() => handleSearch()}
            className="w-full py-3.5 rounded-2xl mb-4 transition-opacity active:opacity-80"
            style={{ background: '#D4A853', color: '#000000', fontFamily: 'Inter', fontWeight: 700, fontSize: '15px' }}
          >
            Audit Regional Prices
          </button>
        )}

        {/* Error */}
        {searchError && (
          <p className="mb-4 text-center" style={{ color: '#D4A853', fontSize: '13px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
            {searchError}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <GoldSpinner size={36} />
            <p style={{ color: '#6B6B6B', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em' }}>
              SCANNING MARKET…
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && results !== null && (
          <>
            <GeminiAIBox advice={geminiAdvice} question={isQuestion(query)} />

            {results.length === 0 ? (
              <div className="py-12 text-center">
                <p style={{ color: '#6B6B6B', fontFamily: 'Inter', fontSize: '14px' }}>
                  No results found. Try a different search.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: '#6B6B6B', fontSize: '11px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>
                    {results.length} POSITIONS · {currency}
                  </p>
                  <span style={{ color: '#D4A853', fontSize: '9px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>
                    GOOGLE SHOPPING
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-28">
                  {results.map((r, i) => (
                    <ProductCard key={i} result={r} currency={currency} onStash={handleStash} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Initial empty state */}
        {!loading && results === null && !searchError && (
          <div className="py-12 text-center">
            <p style={{ fontSize: '44px', lineHeight: 1, marginBottom: '16px' }}>📡</p>
            <p style={{ color: '#F5F0E8', fontSize: '18px', fontFamily: 'Playfair Display, serif', fontWeight: 600, marginBottom: '8px' }}>
              Monitor the market.
            </p>
            <p style={{ color: '#6B6B6B', fontSize: '14px', fontFamily: 'Inter', lineHeight: 1.6 }}>
              Search any product. Stashd finds the best<br />price across national retailers.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
