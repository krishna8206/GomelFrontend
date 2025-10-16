import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useAdmin } from './AdminContext';

const CarContext = createContext();

export const useCars = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCars must be used within CarProvider');
  }
  return context;
};

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hostBookings, setHostBookings] = useState([]);
  const [payouts, setPayouts] = useState([]); // admin view of all payout requests
  const [loading, setLoading] = useState(true);
  const { token: userToken, user } = useAuth();
  const { adminToken } = useAdmin();
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://updatedgomelbackend.onrender.com/api';

  useEffect(() => {
    // Initial load: fetch cars
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/cars`);
        const data = await res.json();
        if (res.ok) setCars(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When admin session is present, load cars and enrich with host details (avoid /cars/admin to prevent 404s)
  useEffect(() => {
    const loadAdminCars = async () => {
      if (!adminToken) return;
      try {
        const res2 = await fetch(`${API_BASE}/cars`);
        if (res2.ok) {
          const data2 = await res2.json();
          const list = Array.isArray(data2) ? data2 : [];
          // Enrich with host details if available
          const hostIds = [...new Set(list.map(c => c.hostId).filter(Boolean))];
          const hostMap = {};
          await Promise.all(hostIds.map(async (id) => {
            try {
              const ur = await fetch(`${API_BASE}/users/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
              });
              const ud = await ur.json();
              if (ur.ok && ud?.user) hostMap[id] = ud.user;
            } catch {}
          }));
          const enriched = list.map(c => {
            const u = c.hostId ? hostMap[c.hostId] : null;
            return u ? { ...c, host: { id: c.hostId, email: u.email, fullName: u.fullName, mobile: u.mobile }, hostEmail: u.email, hostFullName: u.fullName } : c;
          });
          setCars(enriched);
        }
      } catch {}
    };
    loadAdminCars();
  }, [adminToken]);

  // Keep bookings in sync depending on role
  useEffect(() => {
    const loadBookings = async () => {
      try {
        if (adminToken) {
          const res = await fetch(`${API_BASE}/bookings`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          const data = await res.json();
          if (res.ok) {
            const mapped = Array.isArray(data)
              ? data.map((b) => ({
                  ...b,
                  userName: b.user?.fullName || b.userFullName || '-',
                  userEmail: b.user?.email || b.userEmail || '-',
                }))
              : [];
            setBookings(mapped);
          }
        } else if (userToken) {
          const res = await fetch(`${API_BASE}/bookings/me`, {
            headers: { Authorization: `Bearer ${userToken}` },
          });
          const data = await res.json();
          if (res.ok) setBookings(data);
        } else {
          setBookings([]);
        }
      } catch {}
    };
    loadBookings();
  }, [adminToken, userToken, user?.id]);

  // Load bookings for cars owned by the host (when logged in as user)
  useEffect(() => {
    const loadHostBookings = async () => {
      try {
        if (!userToken) { setHostBookings([]); return; }
        const res = await fetch(`${API_BASE}/bookings/host`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const data = await res.json();
        if (res.ok) setHostBookings(data);
      } catch {}
    };
    loadHostBookings();
  }, [userToken, user?.id]);

  // Admin payouts are fetched on-demand from AdminDashboard via adminGetPayouts()

  // Real-time updates via SSE with health-check + retry backoff to avoid noisy 404s
  useEffect(() => {
    if (!userToken && !adminToken) return;
    let es = null;
    let stopped = false;
    let attempt = 0;

    const connect = async () => {
      if (stopped) return;
      try {
        // Quick health check to avoid connecting when backend is down or routes not ready
        const ok = await fetch(`${API_BASE}/health`).then(r => r.ok).catch(() => false);
        if (!ok) throw new Error('backend_unhealthy');
      } catch (_) {
        // retry later
        const delay = Math.min(30000, 1000 * Math.pow(2, attempt++));
        setTimeout(connect, delay);
        return;
      }

      try {
        es = new EventSource(`${API_BASE}/events`);
        es.addEventListener('booking_created', (ev) => {
          try {
            const payload = JSON.parse(ev.data)?.data;
            if (!payload) return;
            if (adminToken) setBookings((prev) => [{ ...payload }, ...prev]);
            if (userToken) {
              fetch(`${API_BASE}/bookings/host`, { headers: { Authorization: `Bearer ${userToken}` }})
                .then(r => r.json())
                .then(d => Array.isArray(d) && setHostBookings(d))
                .catch(()=>{});
            }
          } catch {}
        });
        es.addEventListener('payout_request_created', (ev) => {
          try {
            const payload = JSON.parse(ev.data)?.data;
            if (adminToken && payload) setPayouts((prev) => [{ ...payload }, ...prev]);
          } catch {}
        });
        es.addEventListener('payout_request_updated', (ev) => {
          try {
            const payload = JSON.parse(ev.data)?.data;
            if (adminToken && payload) setPayouts((prev) => prev.map(p => String(p.id)===String(payload.id)? payload : p));
          } catch {}
        });
        es.onerror = () => {
          es?.close();
          const delay = Math.min(30000, 1000 * Math.pow(2, attempt++));
          setTimeout(connect, delay);
        };
        // reset backoff on successful open
        es.onopen = () => { attempt = 0; };
      } catch (_) {
        const delay = Math.min(30000, 1000 * Math.pow(2, attempt++));
        setTimeout(connect, delay);
      }
    };

    connect();
    return () => { stopped = true; try { es?.close(); } catch {} };
  }, [userToken, adminToken]);

  const addCar = async (carData) => {
    // Admin can create at /cars, user hosts create at /cars/host
    const isAdmin = !!adminToken;
    const url = isAdmin ? `${API_BASE}/cars` : `${API_BASE}/cars/host`;
    const bearer = isAdmin ? adminToken : userToken;
    if (!bearer) throw new Error('Not authenticated');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
      body: JSON.stringify(carData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add car');
    setCars((prev) => [data, ...prev]);
    return data;
  };

  const updateCar = async (carId, updates) => {
    const res = await fetch(`${API_BASE}/cars/${carId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update car');
    setCars((prev) => prev.map((c) => (String(c.id) === String(carId) ? data : c)));
    return true;
  };

  const refreshAdminCars = async () => {
    if (!adminToken) return false;
    const res2 = await fetch(`${API_BASE}/cars`);
    if (res2.ok) {
      const list = await res2.json();
      const carsList = Array.isArray(list) ? list : [];
      const hostIds = [...new Set(carsList.map(c => c.hostId).filter(Boolean))];
      const hostMap = {};
      await Promise.all(hostIds.map(async (id) => {
        try {
          const ur = await fetch(`${API_BASE}/users/${id}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          const ud = await ur.json();
          if (ur.ok && ud?.user) hostMap[id] = ud.user;
        } catch {}
      }));
      const enriched = carsList.map(c => {
        const u = c.hostId ? hostMap[c.hostId] : null;
        return u ? { ...c, host: { id: c.hostId, email: u.email, fullName: u.fullName, mobile: u.mobile }, hostEmail: u.email, hostFullName: u.fullName } : c;
      });
      setCars(enriched);
      return true;
    }
    return false;
  };

  const removeCar = async (carId) => {
    // Allow admin or owning host to delete; send whichever token is available
    const bearer = adminToken || userToken;
    if (!bearer) return false;
    const res = await fetch(`${API_BASE}/cars/${carId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bearer}` },
    });
    if (!res.ok) return false;
    setCars((prev) => prev.filter((c) => String(c.id) !== String(carId)));
    return true;
  };

  const getCarById = (id) => {
    return cars.find(car => String(car.id) === String(id));
  };

  const getCarsByCity = (city) => {
    if (!city) return cars;
    return cars.filter(car => car.city === city);
  };

  const addBooking = async (bookingData) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create booking');
    setBookings((prev) => [data, ...prev]);
    return data;
  };

  const removeBooking = async (bookingId) => {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) return false;
    setBookings((prev) => prev.filter((b) => String(b.id) !== String(bookingId)));
    return true;
  };

  const getUserBookings = async () => {
    const res = await fetch(`${API_BASE}/bookings/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.ok) setBookings(data);
    return data;
  };

  const getAllBookings = async () => {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.ok) {
      const mapped = Array.isArray(data)
        ? data.map((b) => ({
            ...b,
            userName: b.user?.fullName || b.userFullName || '-',
            userEmail: b.user?.email || b.userEmail || '-',
          }))
        : [];
      setBookings(mapped);
      return mapped;
    }
    return data;
  };

  // Host: list bookings for own cars
  const getHostBookings = async () => {
    if (!userToken) {
      setHostBookings([]);
      return [];
    }
    const res = await fetch(`${API_BASE}/bookings/host`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.ok) setHostBookings(data);
    return data;
  };

  // Host: request payout for a booking
  const requestPayout = async (bookingId, amount, note) => {
    const res = await fetch(`${API_BASE}/payouts/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ bookingId, amount, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request payout');
    return data;
  };

  // Admin: payouts
  const adminGetPayouts = async () => {
    if (!adminToken) { setPayouts([]); return []; }
    // Only attempt on admin routes to avoid SPA 404 fallbacks
    const isAdminPage = typeof window !== 'undefined' && /\/admin(\/|$)/.test(window.location.pathname);
    if (!isAdminPage) return [];
    try {
      // Validate admin session before hitting payouts to avoid spurious 404s
      const meRes = await fetch(`${API_BASE}/admin/me`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!meRes.ok) return [];
      const res = await fetch(`${API_BASE}/payouts`, { headers: { Authorization: `Bearer ${adminToken}` } });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text().then(t => ({ error: t?.slice(0,120) }));
      if (res.ok) {
        const list = Array.isArray(data) ? data : [];
        setPayouts(list);
        return list;
      }
      // Silently ignore 404s and return empty
      if (res.status === 404) {
        return [];
      }
      // For other errors, return what we got for caller to decide
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  };
  const adminApprovePayout = async (id) => {
    const res = await fetch(`${API_BASE}/payouts/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve');
    setPayouts((prev) => prev.map(p => String(p.id)===String(id) ? data : p));
    return true;
  };
  const adminRejectPayout = async (id) => {
    const res = await fetch(`${API_BASE}/payouts/${id}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject');
    setPayouts((prev) => prev.map(p => String(p.id)===String(id) ? data : p));
    return true;
  };

  const submitContactForm = async (formData) => {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit');
    return data;
  };

  const getAllMessages = async () => {
    const res = await fetch(`${API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    return data;
  };

  const deleteMessage = async (messageId) => {
    const res = await fetch(`${API_BASE}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.ok;
  };

  const getMessage = async (id) => {
    const res = await fetch(`${API_BASE}/messages/${id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load message');
    return data;
  };

  const replyToMessage = async (id, reply) => {
    const res = await fetch(`${API_BASE}/messages/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reply })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reply');
    return true;
  };

  const value = {
    cars,
    bookings,
    hostBookings,
    payouts,
    loading,
    addCar,
    updateCar,
    removeCar,
    getCarById,
    getCarsByCity,
    addBooking,
    removeBooking,
    getUserBookings,
    getAllBookings,
    getHostBookings,
    submitContactForm,
    getAllMessages,
    deleteMessage,
    getMessage,
    replyToMessage,
    refreshAdminCars,
    requestPayout,
    adminGetPayouts,
    adminApprovePayout,
    adminRejectPayout
  };

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>;
};

