import React, { useEffect, useState } from 'react';
import { loadAuth, isSignedIn } from '../../services/authState';

/** The main app only opens for a signed-in user. Everyone else is sent to the welcome screen. */
export default function AuthGate({ navigation, children }) {
  const [ok, setOk] = useState(isSignedIn());

  useEffect(() => {
    if (ok) return undefined;
    let live = true;
    loadAuth().then((a) => {
      if (!live) return;
      if (a.signedIn) setOk(true);
      else navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    });
    return () => { live = false; };
  }, [ok, navigation]);

  return ok ? children : null;
}