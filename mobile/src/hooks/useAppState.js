import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** 'active' | 'background' | 'inactive'. Lets streams pause when the app is not in front. */
export function useAppState() {
  const [state, setState] = useState(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', setState);
    return () => sub.remove();
  }, []);
  return state;
}
