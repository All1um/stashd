import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_PROFILE = {
  country_code: 'CA',
  region:       'British Columbia',
  currency:     'CAD',
  display_name: null,
};

const AuthContext = createContext();

// ── OAuth URL cleanup ──────────────────────────────────────
function cleanOAuthFragment() {
  if (
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token') ||
    window.location.hash.includes('error_description')
  ) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

// ── Geo helpers ────────────────────────────────────────────

async function detectLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const geo = await res.json();
    if (geo.error) return null;
    return {
      country_code: (geo.country_code ?? 'CA').toUpperCase(),
      region:       geo.region       ?? 'British Columbia',
      currency:     geo.currency     ?? 'CAD',
    };
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [profile,         setProfile]         = useState(DEFAULT_PROFILE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth,   setIsLoadingAuth]   = useState(true);

  // Load existing profile from DB
  const loadProfile = async (authUser) => {
    const { data } = await supabase
      .from('profiles')
      .select('country_code, region, currency, display_name')
      .eq('id', authUser.id)
      .maybeSingle();

    setProfile(data ?? DEFAULT_PROFILE);
    return data;
  };

  // Create profile — only called for genuine new sign-ups
  const createNewProfile = async (authUser) => {
    const geo      = await detectLocation();
    const location = geo ?? DEFAULT_PROFILE;

    const { data } = await supabase
      .from('profiles')
      .upsert({
        id:           authUser.id,
        email:        authUser.email,
        display_name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
        country_code: location.country_code,
        region:       location.region,
        currency:     location.currency,
      }, { onConflict: 'id' })
      .select('country_code, region, currency, display_name')
      .maybeSingle();

    setProfile(data ?? location);
  };

  useEffect(() => {
    cleanOAuthFragment();

    // Safety valve: if getSession takes >3s (slow network), unblock the UI.
    // 3s instead of 1.5s to reduce false positive AuthScreen flashes.
    const safetyTimer = setTimeout(() => setIsLoadingAuth(false), 3000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(safetyTimer);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      if (session?.user) await loadProfile(session.user);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);

      if (event === 'SIGNED_IN' && session?.user) {
        cleanOAuthFragment();
        // Only run geo + upsert for genuinely new accounts.
        // Session restores (page refresh) also fire SIGNED_IN — distinguish them
        // by checking if a profile row already exists.
        const existing = await loadProfile(session.user);
        if (!existing) {
          await createNewProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(DEFAULT_PROFILE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google' });

  const signInWithEmail = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && result.data.user) await loadProfile(result.data.user);
    return result;
  };

  const signUpWithEmail = async (email, password) => {
    const result = await supabase.auth.signUp({ email, password });
    if (!result.error && result.data.user) await createNewProfile(result.data.user);
    return result;
  };

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoadingAuth,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
