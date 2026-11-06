import { useCallback } from 'react';
import { useStore } from '../../app/store';
import { startSession } from '../../services/authState';

/**
 * Finishes a sign-in: saves the session, loads the account's data, then opens the app.
 * `after` runs once the data has loaded (used to save profile details after sign-up).
 */
export function useSignIn(navigation) {
  const { reload } = useStore();
  return useCallback(async (token, opts, after) => {
    await startSession(token, opts);
    await reload();
    if (after) after();
    navigation.reset({ index: 0, routes: [{ name: 'Main', params: { tab: 'overview' } }] });
  }, [navigation, reload]);
}