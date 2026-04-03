import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Onboarding from './Onboarding';
import AuthScreen from './AuthScreen';
import StashdApp from './StashdApp';

export default function Home() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [onboarded, setOnboarded] = useState(() =>
    localStorage.getItem('stashd_onboarded') === '1'
  );

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" className="animate-spin">
          <circle cx="14" cy="14" r="11" fill="none" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="14" cy="14" r="11" fill="none" stroke="#D4A853" strokeWidth="3"
            strokeLinecap="round" strokeDasharray="52 18" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!onboarded) {
      return (
        <Onboarding
          onComplete={() => {
            localStorage.setItem('stashd_onboarded', '1');
            setOnboarded(true);
          }}
        />
      );
    }
    return <AuthScreen />;
  }

  return <StashdApp />;
}
