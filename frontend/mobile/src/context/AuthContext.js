// src/context/AuthContext.js
// Global authentication state — token, user profile, role

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { saveToken, getToken, clearToken } from '../api/client';
import { getMe } from '../api/users';

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from SecureStore
  useEffect(() => {
    async function bootstrap() {
      try {
        const stored = await getToken();
        if (stored) {
          setToken(stored);
          const profile = await getMe();
          setUser(profile);
          setRole(profile.roles?.[0] ?? null);
        }
      } catch {
        // Token expired or invalid — clear it
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  /**
   * Called after a successful login or registration.
   * Stores the token and fetches the user profile.
   */
  const signIn = useCallback(async (authResponse) => {
    const { token: newToken, role: responseRole } = authResponse;
    await saveToken(newToken);
    setToken(newToken);
    setRole(responseRole);
    // Fetch full profile from /api/users/me
    try {
      const profile = await getMe();
      setUser(profile);
    } catch {
      // Fall back to partial data from auth response
      setUser({
        userId: authResponse.userId,
        email: authResponse.email,
        firstName: null,
        lastName: null,
        roles: [responseRole],
      });
    }
  }, []);

  /**
   * Update cached user name after profile edit.
   */
  const refreshUser = useCallback(async () => {
    try {
      const profile = await getMe();
      setUser(profile);
    } catch { /* silent */ }
  }, []);

  /**
   * Sign out — clear token and reset state.
   */
  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  const value = {
    token,
    user,
    role,
    isLoading,
    isAuthenticated: !!token,
    isStudent: role === 'Student',
    isEmployer: role === 'Employer',
    signIn,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
