import { useState } from 'react';
import Onboarding from './Onboarding';
import StashdApp from './StashdApp';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <Onboarding onComplete={() => setLoggedIn(true)} />;
  }

  return <StashdApp />;
}
