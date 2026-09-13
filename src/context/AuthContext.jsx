import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_STORAGE_KEY = "@market_app/auth_state";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // isLoading drives the Splash screen - it stays true only long enough
  // to check whether a previous session was saved on this device.
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState({});

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (stored && isMounted) {
          const parsed = JSON.parse(stored);

          setIsAuthenticated(Boolean(parsed.isAuthenticated));
          setHasCompletedOnboarding(Boolean(parsed.hasCompletedOnboarding));
          setOnboardingAnswers(parsed.onboardingAnswers || {});
        }
      } catch (error) {
        // If storage can't be read, fall back to a signed-out state
        // rather than blocking the app from loading.
        console.warn("Failed to restore auth session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persist = useCallback(async (nextState) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.warn("Failed to persist auth session:", error);
    }
  }, []);

  // Mock sign up - swap this out for a real API call later.
  // New accounts always go through onboarding.
  const signUp = useCallback(
    async (email, password) => {
      setIsAuthenticated(true);
      setHasCompletedOnboarding(false);
      setOnboardingAnswers({});

      await persist({
        isAuthenticated: true,
        hasCompletedOnboarding: false,
        onboardingAnswers: {},
      });
    },
    [persist]
  );

  // Mock login - returning users skip straight back into the main app
  // using whatever onboarding state was previously saved.
  const login = useCallback(
    async (email, password) => {
      setIsAuthenticated(true);

      await persist({
        isAuthenticated: true,
        hasCompletedOnboarding,
        onboardingAnswers,
      });
    },
    [persist, hasCompletedOnboarding, onboardingAnswers]
  );

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setOnboardingAnswers({});

    await persist({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      onboardingAnswers: {},
    });
  }, [persist]);

  // Called as the user moves through the optional questions - answering
  // or skipping either way just merges whatever was selected so far.
  const saveOnboardingAnswers = useCallback(
    async (answers) => {
      const merged = { ...onboardingAnswers, ...answers };
      setOnboardingAnswers(merged);

      await persist({
        isAuthenticated,
        hasCompletedOnboarding,
        onboardingAnswers: merged,
      });
    },
    [onboardingAnswers, isAuthenticated, hasCompletedOnboarding, persist]
  );

  // Called from "Skip setup", "Finish", and "Go to App" - all three exits
  // land the user in the main app with no further setup required.
  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);

    await persist({
      isAuthenticated,
      hasCompletedOnboarding: true,
      onboardingAnswers,
    });
  }, [isAuthenticated, onboardingAnswers, persist]);

  const value = {
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    onboardingAnswers,
    signUp,
    login,
    logout,
    saveOnboardingAnswers,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}