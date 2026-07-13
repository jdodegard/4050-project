import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';
import * as userApi from '../api/userApi';

// who's signed in + their favorite movie ids, shared across the whole app so
// the navbar and every heart icon stay in sync
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [favIds, setFavIds] = useState(new Set());

  const loadFavorites = useCallback(() => {
    userApi.fetchFavorites()
      .then(movies => setFavIds(new Set(movies.map(m => m.id))))
      .catch(() => setFavIds(new Set()));
  }, []);

  // restore the session on page load
  useEffect(() => {
    authApi.fetchCurrentUser()
      .then(u => {
        setUser(u);
        if (u) loadFavorites();
      })
      .finally(() => setChecking(false));
  }, [loadFavorites]);

  async function login(email, password) {
    const u = await authApi.login(email, password);
    setUser(u);
    loadFavorites();
    return u;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* session may already be gone */ }
    setUser(null);
    setFavIds(new Set());
  }

  /** Flips a movie in/out of favorites. Returns the new "is favorite" state. */
  async function toggleFavorite(movieId) {
    if (favIds.has(movieId)) {
      await userApi.removeFavorite(movieId);
      setFavIds(prev => { const next = new Set(prev); next.delete(movieId); return next; });
      return false;
    }
    await userApi.addFavorite(movieId);
    setFavIds(prev => new Set(prev).add(movieId));
    return true;
  }

  const value = { user, setUser, checking, login, logout, favIds, toggleFavorite, refreshFavorites: loadFavorites };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
