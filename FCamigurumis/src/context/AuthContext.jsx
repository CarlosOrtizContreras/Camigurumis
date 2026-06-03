// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('cami_user')) || null; }
    catch { return null; }
  });

  function login(userData) {
    setUser(userData);
    sessionStorage.setItem('cami_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem('cami_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
