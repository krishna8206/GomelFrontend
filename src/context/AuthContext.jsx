import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://updatedgomelbackend.onrender.com/api';

  useEffect(() => {
    const savedUser = localStorage.getItem('gomel_user');
    const savedToken = localStorage.getItem('gomel_token');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  // Validate token with backend to avoid stale/invalid tokens breaking API calls
  useEffect(() => {
    const validate = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // Clear invalid token and user silently
          localStorage.removeItem('gomel_user');
          localStorage.removeItem('gomel_token');
          setUser(null);
          setToken(null);
        } else {
          // Optionally refresh user dto from server
          const data = await res.json().catch(() => null);
          if (data?.user) setUser(data.user);
        }
      } catch (_) {
        // Network error: do not force logout, but keep UI from blocking
      }
    };
    validate();
  }, [token]);

  const signup = async (email, password, fullName, mobile) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, mobile })
      });
      const data = await res.json();
      if (!res.ok) return { user: null, error: data.error || 'Signup failed' };
      localStorage.setItem('gomel_user', JSON.stringify(data.user));
      localStorage.setItem('gomel_token', data.token);
      setUser(data.user);
      setToken(data.token);
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { user: null, error: data.error || 'Login failed' };
      localStorage.setItem('gomel_user', JSON.stringify(data.user));
      localStorage.setItem('gomel_token', data.token);
      setUser(data.user);
      setToken(data.token);
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  };

  // Google login removed

  const logout = async () => {
    localStorage.removeItem('gomel_user');
    localStorage.removeItem('gomel_token');
    setUser(null);
    setToken(null);
  };

  // --- OTP FLOW ---
  const requestOtp = async (email, purpose = 'login') => {
    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      return { success: true, expiresAt: data.expiresAt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = async ({ email, code, fullName, mobile, password }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, fullName, mobile, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      localStorage.setItem('gomel_user', JSON.stringify(data.user));
      localStorage.setItem('gomel_token', data.token);
      setUser(data.user);
      setToken(data.token);
      return { user: data.user, token: data.token, error: null };
    } catch (error) {
      return { user: null, token: null, error: error.message };
    }
  };

  // Forgot password helpers removed

  // Start password + OTP (2FA) login flow
  const loginStartPassword = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return { pendingOtp: true, expiresAt: data.expiresAt };
    } catch (error) {
      return { pendingOtp: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    token,
    signup,
    login,
    logout,
    requestOtp,
    verifyOtp,
    loginStartPassword,
    
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
