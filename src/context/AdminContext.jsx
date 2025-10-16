import { createContext, useContext, useEffect, useState } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

// Static admin credentials (can be changed)
const ADMIN_EMAIL = 'admin@gomelcars.com';
const ADMIN_PASSWORD = 'admin123';

export const AdminProvider = ({ children }) => {
  const initialToken = typeof window !== 'undefined' ? localStorage.getItem('gomel_admin_token') : null;
  const [adminToken, setAdminToken] = useState(initialToken);
  const [isAdmin, setIsAdmin] = useState(!!initialToken);
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://gomelbackend.onrender.com/api';

  // Optional: could validate token with backend here if endpoint exists
  // useEffect(() => { ...fetch /admin/me... })

  const loginAdmin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Invalid admin credentials' };
      localStorage.setItem('gomel_admin_token', data.token);
      setAdminToken(data.token);
      setIsAdmin(true);
      return { error: null };
    } catch (e) {
      return { error: e.message };
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminToken(null);
    localStorage.removeItem('gomel_admin_token');
  };

  return (
    <AdminContext.Provider value={{ isAdmin, adminToken, loginAdmin, logoutAdmin, ADMIN_EMAIL }}>
      {children}
    </AdminContext.Provider>
  );
};
