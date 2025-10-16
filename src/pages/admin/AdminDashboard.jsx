import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useCars } from '../../context/CarContext';
import CarModal from './components/CarModal';
import BookingModal from './components/BookingModal';

// Helper: safely parse JSON or throw a readable error if HTML/text
const parseJsonSafe = async (res) => {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return await res.json();
  }
  // Fallback to text (likely HTML error page)
  const text = await res.text();
  const snippet = text.slice(0, 120).replace(/\n/g, ' ');
  throw new Error(res.status + ' ' + res.statusText + (snippet ? ` – ${snippet}` : ''));
};

// Dynamic API base for admin-only direct fetches
const API_BASE = import.meta.env.VITE_API_BASE || 'https://updatedgomelbackend.onrender.com/api';

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl p-6 border border-primary/20 shadow-sm">
    <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>
    {children}
  </div>
);

const AdminDashboard = () => {
  const { logoutAdmin, adminToken } = useAdmin();
  const {
    cars,
    bookings,
    payouts,
    addCar,
    updateCar,
    removeCar,
    removeBooking,
    getAllMessages,
    deleteMessage,
    getMessage,
    replyToMessage,
    adminGetPayouts,
    adminApprovePayout,
    adminRejectPayout,
  } = useCars();

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('overview'); // overview | cars | bookings | messages | users | payouts
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError] = useState('');
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [carsQuery, setCarsQuery] = useState('');
  const [bookingsQuery, setBookingsQuery] = useState('');
  const [messagesQuery, setMessagesQuery] = useState('');
  // Users tab state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // detailed user payload
  const [userModalOpen, setUserModalOpen] = useState(false);

  const getCarName = (id) => {
    const car = cars.find((c) => String(c.id) === String(id));
    return car?.name || '';
  };

  const toggleAvailability = (car) => {
    updateCar(car.id, { available: !car.available });
  };

  // Fetch messages when messages tab active
  const fetchMessages = async () => {
    try {
      setMessagesLoading(true);
      const data = await getAllMessages();
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
    // Keep overview counts up to date by initializing payouts when viewing overview
    if (activeTab === 'overview' && adminToken) {
      (async () => {
        try { await adminGetPayouts(); } catch { /* ignore */ }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Preload messages when admin logs in so Overview shows correct count immediately
  useEffect(() => {
    if (adminToken) {
      fetchMessages();
      // Safe prefetch of payouts so Overview shows correct count; guarded in adminGetPayouts
      (async () => {
        try { await adminGetPayouts(); } catch { /* ignore */ }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  // Light polling to keep count fresh (stops on unmount)
  useEffect(() => {
    if (!adminToken) return;
    const id = setInterval(() => {
      fetchMessages();
    }, 10000); // 10s
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const handleDeleteCar = (carId) => {
    if (confirm('Delete this car?')) removeCar(carId);
  };

  const handleDeleteBooking = (bookingId) => {
    if (confirm('Delete this booking?')) removeBooking(bookingId);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingModalOpen(true);
  };

  const handleDeleteMessage = (id) => {
    const run = async () => {
      if (confirm('Delete this message?')) {
        await deleteMessage(id);
        await fetchMessages();
      }
    };
    run();
  };

  const openMessage = async (id) => {
    // Optimistically open from local list to avoid 404s
    const local = messages.find(m => String(m.id) === String(id));
    if (local) {
      setSelectedMessage(local);
      setReplyText('');
      setMessageModalOpen(true);
      // We already have the record; skip server fetch to avoid 404 noise
      return;
    }
    // Fallback: fetch from server if not in local list
    try {
      const data = await getMessage(id);
      setSelectedMessage(data);
      setReplyText('');
      setMessageModalOpen(true);
    } catch (e) {
      alert(e.message || 'Message not found');
    }
  };

  const sendReply = async () => {
    if (!selectedMessage?.id) return;
    if (!replyText.trim()) {
      setToast({ show: true, message: 'Reply cannot be empty', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 2500);
      return;
    }
    try {
      setReplySending(true);
      await replyToMessage(selectedMessage.id, replyText.trim());
      setMessageModalOpen(false);
      setSelectedMessage(null);
      setReplyText('');
      await fetchMessages();
      // Nice popup instead of alert
      setToast({ show: true, message: 'Reply sent successfully', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2500);
    } catch (e) {
      setToast({ show: true, message: e.message || 'Failed to send reply', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
    } finally {
      setReplySending(false);
    }
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setCarModalOpen(true);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setCarModalOpen(true);
  };

  const handleSaveCar = (carData) => {
    if (editingCar?.id) {
      updateCar(editingCar.id, carData);
    } else {
      addCar(carData);
    }
    setCarModalOpen(false);
    setEditingCar(null);
  };

  // Fetch users when Users tab active
  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'users') return;
      setUsersLoading(true);
      setUsersError('');
      try {
        const res = await fetch(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await parseJsonSafe(res);
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch users');
        setUsers(data);
      } catch (e) {
        setUsersError(e.message);
      } finally {
        setUsersLoading(false);
      }
    };
    if (adminToken) fetchUsers();
  }, [activeTab, adminToken]);

  const openUserDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.error || 'Failed to load user');
      setSelectedUser(data);
      setUserModalOpen(true);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-7xl mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
         
        </div>

        {/* Tabs */}
        <div className="bg-white border border-primary/20 rounded-xl p-2 flex flex-wrap gap-2">
          {['overview','cars','bookings','messages','users','payouts'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-2 text-sm md:px-4 md:text-base rounded-lg capitalize ${activeTab===t ? 'bg-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'}`}
            >{t}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <Section title="Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-primary/20 bg-white">
                <p className="text-muted">Total Cars</p>
                <p className="text-3xl font-bold text-primary">{cars.length}</p>
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-white">
                <p className="text-muted">Total Bookings</p>
                <p className="text-3xl font-bold text-primary">{bookings.length}</p>
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-white">
                <p className="text-muted">Messages</p>
                <p className="text-3xl font-bold text-primary">{messages.length}</p>
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-white md:col-span-3">
                <p className="text-muted">Payout Requests</p>
                <p className="text-3xl font-bold text-primary">{payouts.length}</p>
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'cars' && (
        <Section title="Cars">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <input
              type="text"
              value={carsQuery}
              onChange={(e) => setCarsQuery(e.target.value)}
              placeholder="Search cars by name, city, price, availability..."
              className="w-full md:w-80 px-3 py-2 border border-primary/30 rounded-lg"
            />
            <button onClick={handleAddCar} className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark">Add Car</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4">Price/Day</th>
                  <th className="py-2 pr-4">Host</th>
                  <th className="py-2 pr-4">Available</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars
                  .filter((c) => {
                    const q = carsQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      c.name?.toLowerCase().includes(q) ||
                      c.city?.toLowerCase().includes(q) ||
                      String(c.pricePerDay).includes(q) ||
                      (c.available ? 'yes' : 'no').includes(q)
                    );
                  })
                  .map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{c.name}</td>
                    <td className="py-2 pr-4">{c.city}</td>
                    <td className="py-2 pr-4">₹{c.pricePerDay}</td>
                    <td className="py-2 pr-4">
                      {c.host || c.hostEmail ? (
                        <div className="flex flex-col">
                          <span className="font-semibold">{c.host?.fullName || c.hostFullName || '-'}</span>
                          <span className="text-xs text-muted">{c.host?.email || c.hostEmail || '-'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-white ${c.available ? 'bg-green-600' : 'bg-gray-500'}`}>{c.available ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="py-2 pr-4 space-x-2">
                      <button onClick={() => toggleAvailability(c)} className="px-3 py-1 bg-primary text-white rounded hover:bg-primaryDark">Toggle</button>
                      <button onClick={() => handleEditCar(c)} className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">Edit</button>
                      <button onClick={() => handleDeleteCar(c.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                    </td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
          <CarModal open={carModalOpen} onClose={()=>setCarModalOpen(false)} onSave={handleSaveCar} initial={editingCar} />
        </Section>
        )}

        {activeTab === 'bookings' && (
        <Section title="Bookings">
          {bookings.length === 0 ? (
            <p className="text-muted">No bookings yet.</p>
          ) : (
            <div>
              <div className="mb-3">
                <input
                  type="text"
                  value={bookingsQuery}
                  onChange={(e) => setBookingsQuery(e.target.value)}
                  placeholder="Search bookings by ID, user, email, car, status..."
                  className="w-full md:w-96 px-3 py-2 border border-primary/30 rounded-lg"
                />
              </div>
              {/* Mobile list */}
              <div className="block md:hidden space-y-2">
                {bookings
                  .filter((b) => {
                    const q = bookingsQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      String(b.id).toLowerCase().includes(q) ||
                      b.userName?.toLowerCase().includes(q) ||
                      b.userEmail?.toLowerCase().includes(q) ||
                      String(b.carId).toLowerCase().includes(q) ||
                      (b.status || '').toLowerCase().includes(q)
                    );
                  })
                  .map((b) => (
                    <div key={b.id} className="border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">#{b.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{b.status || '-'}</span>
                      </div>
                      <div className="mt-1 text-sm">
                        <div className="font-semibold">{b.user?.fullName || b.userName || '-'}</div>
                        <div className="text-muted">{b.user?.email || b.userEmail || '-'}</div>
                        <div className="text-muted">Car: {getCarName(b.carId) || b.carName || b.carId || '-'}</div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => handleViewBooking(b)} className="flex-1 px-3 py-2 bg-primary text-white rounded">View</button>
                        <button onClick={() => handleDeleteBooking(b.id)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b">
                      <th className="py-2 pr-4">Booking ID</th>
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2 pr-4">Car</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter((b) => {
                        const q = bookingsQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          String(b.id).toLowerCase().includes(q) ||
                          b.userName?.toLowerCase().includes(q) ||
                          b.userEmail?.toLowerCase().includes(q) ||
                          String(b.carId).toLowerCase().includes(q) ||
                          (b.status || '').toLowerCase().includes(q)
                        );
                      })
                      .map((b) => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{b.id}</td>
                        <td className="py-2 pr-4">
                          <div className="flex flex-col">
                            <span className="font-semibold">{b.user?.fullName || b.userName || '-'}</span>
                            <span className="text-xs text-muted">{b.user?.email || b.userEmail || '-'}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">{getCarName(b.carId) || b.carName || b.carId || '-'}</td>
                        <td className="py-2 pr-4">{b.status || '-'}</td>
                        <td className="py-2 pr-4 space-x-2">
                          <button onClick={() => handleViewBooking(b)} className="px-3 py-1 bg-primary text-white rounded hover:bg-primaryDark">View</button>
                          <button onClick={() => handleDeleteBooking(b.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                        </td>
                      </tr>
                    ))
                  }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>
        )}

        {activeTab === 'payouts' && (
          <Section title="Payouts">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={async () => {
                  try {
                    setPayoutsLoading(true);
                    setPayoutsError('');
                    await adminGetPayouts();
                  } catch (e) {
                    setPayoutsError(e.message || 'Failed to load payouts');
                  } finally {
                    setPayoutsLoading(false);
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark"
              >
                {payoutsLoading ? 'Loading…' : 'Refresh'}
              </button>
              {payoutsError && (
                <span className="text-sm text-red-600">{payoutsError}</span>
              )}
            </div>
            {payouts.length === 0 ? (
              <p className="text-muted">No payout requests.</p>
            ) : (
              <>
                {/* Mobile list */}
                <div className="block md:hidden space-y-2">
                  {payouts.map(p => (
                    <div key={p.id} className="border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">#{p.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{p.status}</span>
                      </div>
                      <div className="mt-1 text-sm">
                        <div className="font-semibold">₹{p.amount}</div>
                        <div className="text-muted">Booking: {p.bookingId}</div>
                        <div className="text-muted">Host: {p.host?.fullName || '-'} • {p.host?.email || `Host #${p.hostId}`}</div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          disabled={p.status !== 'pending'}
                          title={p.status !== 'pending' ? 'Only pending requests can be approved' : ''}
                          onClick={async ()=>{ try { await adminApprovePayout(p.id); } catch(e){ alert(e.message||'Failed'); } }}
                          className={`flex-1 px-3 py-2 rounded text-white ${p.status !== 'pending' ? 'bg-green-600/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >Approve</button>
                        <button
                          disabled={p.status !== 'pending'}
                          title={p.status !== 'pending' ? 'Only pending requests can be rejected' : ''}
                          onClick={async ()=>{ try { await adminRejectPayout(p.id); } catch(e){ alert(e.message||'Failed'); } }}
                          className={`flex-1 px-3 py-2 rounded text-white ${p.status !== 'pending' ? 'bg-red-600/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted border-b">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Booking ID</th>
                        <th className="py-2 pr-4">Host</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map(p => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{p.id}</td>
                          <td className="py-2 pr-4">{p.bookingId}</td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-col">
                              <span className="font-semibold">{p.host?.fullName || '-'}</span>
                              <span className="text-xs text-muted">{p.host?.email || `Host #${p.hostId}`}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4">₹{p.amount}</td>
                          <td className="py-2 pr-4">{p.status}</td>
                          <td className="py-2 pr-4 space-x-2">
                            <button
                              disabled={p.status !== 'pending'}
                              title={p.status !== 'pending' ? 'Only pending requests can be approved' : ''}
                              onClick={async ()=>{ try { await adminApprovePayout(p.id); } catch(e){ alert(e.message||'Failed'); } }}
                              className={`px-3 py-1 rounded text-white ${p.status !== 'pending' ? 'bg-green-600/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            >Approve</button>
                            <button
                              disabled={p.status !== 'pending'}
                              title={p.status !== 'pending' ? 'Only pending requests can be rejected' : ''}
                              onClick={async ()=>{ try { await adminRejectPayout(p.id); } catch(e){ alert(e.message||'Failed'); } }}
                              className={`px-3 py-1 rounded text-white ${p.status !== 'pending' ? 'bg-red-600/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                            >Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Section>
        )}

        {activeTab === 'users' && (
          <Section title="Users">
            {usersError && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">{usersError}</div>
            )}
            {usersLoading ? (
              <p className="text-muted">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-muted">No users found.</p>
            ) : (
              <>
                {/* Mobile list */}
                <div className="block md:hidden space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="border border-primary/20 rounded-lg p-3">
                      <div className="font-semibold">{u.fullName || '-'}</div>
                      <div className="text-sm text-muted">{u.email}</div>
                      <div className="text-sm text-muted">{u.mobile || '-'}</div>
                      <div className="text-sm text-muted">Bookings: {u.bookingCount || 0} • Spent: ₹{u.totalSpent || 0}</div>
                      <div className="mt-2">
                        <button onClick={() => openUserDetails(u.id)} className="w-full px-3 py-2 bg-primary text-white rounded">View</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted border-b">
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Mobile</th>
                        <th className="py-2 pr-4">Bookings</th>
                        <th className="py-2 pr-4">Total Spent</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{u.email}</td>
                          <td className="py-2 pr-4">{u.fullName || '-'}</td>
                          <td className="py-2 pr-4">{u.mobile || '-'}</td>
                          <td className="py-2 pr-4">{u.bookingCount || 0}</td>
                          <td className="py-2 pr-4">₹{u.totalSpent || 0}</td>
                          <td className="py-2 pr-4">
                            <button onClick={() => openUserDetails(u.id)} className="px-3 py-1 bg-primary text-white rounded hover:bg-primaryDark">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {/* User details modal */}
            {userModalOpen && selectedUser && (
              <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                <div className="w-full md:max-w-4xl bg-white rounded-xl border border-primary/20 shadow-xl max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
                    <h3 className="text-xl font-bold text-primary">User Details</h3>
                    <button onClick={() => setUserModalOpen(false)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Email</p><p className="font-semibold">{selectedUser.user.email}</p></div>
                      <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Name</p><p className="font-semibold">{selectedUser.user.fullName || '-'}</p></div>
                      <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Mobile</p><p className="font-semibold">{selectedUser.user.mobile || '-'}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Bookings</p><p className="font-semibold">{selectedUser.aggregates.bookingCount}</p></div>
                      <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Total Spent</p><p className="font-semibold">₹{selectedUser.aggregates.totalSpent}</p></div>
                      <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Messages</p><p className="font-semibold">{selectedUser.aggregates.messageCount}</p></div>
                    </div>
                    <div className="border-t border-primary/20 pt-4">
                      <h4 className="font-semibold text-primary mb-2">Recent Bookings</h4>
                      {selectedUser.bookings.length === 0 ? (
                        <p className="text-muted text-sm">No bookings.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted border-b">
                                <th className="py-2 pr-4">ID</th>
                                <th className="py-2 pr-4">Car</th>
                                <th className="py-2 pr-4">Pickup</th>
                                <th className="py-2 pr-4">Return</th>
                                <th className="py-2 pr-4">Total</th>
                                <th className="py-2 pr-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedUser.bookings.map(b => (
                                <tr key={b.id} className="border-b last:border-0">
                                  <td className="py-2 pr-4">{b.id}</td>
                                  <td className="py-2 pr-4">{getCarName(b.carId) || b.carName || b.carId}</td>
                                  <td className="py-2 pr-4">{b.pickupDate}</td>
                                  <td className="py-2 pr-4">{b.returnDate}</td>
                                  <td className="py-2 pr-4">₹{b.totalCost}</td>
                                  <td className="py-2 pr-4">{b.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-primary/20 pt-4">
                      <h4 className="font-semibold text-primary mb-2">Messages</h4>
                      {selectedUser.messages.length === 0 ? (
                        <p className="text-muted text-sm">No messages.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedUser.messages.map(m => (
                            <div key={m.id} className="border border-primary/20 rounded p-3">
                              <p className="text-sm text-text">{m.message}</p>
                              <p className="text-xs text-muted mt-1">{m.email} • {m.createdAt}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}

        {activeTab === 'messages' && (
        <Section title="Messages">
          {messagesLoading ? (
            <p className="text-muted">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-muted">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="mb-2">
                <input
                  type="text"
                  value={messagesQuery}
                  onChange={(e) => setMessagesQuery(e.target.value)}
                  placeholder="Search messages by name, email, content..."
                  className="w-full md:w-96 px-3 py-2 border border-primary/30 rounded-lg"
                />
              </div>
              {messages
                .filter((m) => {
                  const q = messagesQuery.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    m.name?.toLowerCase().includes(q) ||
                    m.email?.toLowerCase().includes(q) ||
                    m.message?.toLowerCase().includes(q)
                  );
                })
                .map((m) => (
                <div key={m.id} className="border border-primary/20 rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-text">
                      {m.name} • {m.email}
                      {m.status === 'replied' && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-600 text-white">Replied</span>
                      )}
                    </p>
                    <p className="text-muted text-sm mt-1">{m.message}</p>
                  </div>
                  <div className="space-x-2 whitespace-nowrap">
                    <button onClick={() => openMessage(m.id)} className="px-3 py-1 bg-primary text-white rounded hover:bg-primaryDark">View</button>
                    <button onClick={() => handleDeleteMessage(m.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                  </div>
                </div>
              ))
              }
              </div>
          )}
        </Section>
        )}
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-6 right-6 z-[120] px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}

        {/* Message view/reply modal */}
        {messageModalOpen && selectedMessage && (
          <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
            <div className="w-full md:max-w-2xl bg-white rounded-xl border border-primary/20 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
                <h3 className="text-xl font-bold text-primary">Message from {selectedMessage.name}</h3>
                <button onClick={() => setMessageModalOpen(false)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Email</p><p className="font-semibold">{selectedMessage.email}</p></div>
                  <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Status</p><p className="font-semibold capitalize">{selectedMessage.status}</p></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-primary/20">
                  <p className="text-muted text-sm mb-1">Message</p>
                  <p className="text-sm">{selectedMessage.message}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-primary/20">
                  <p className="text-muted text-sm mb-2">Reply</p>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 border border-primary/30 rounded-lg focus:outline-none"
                    placeholder="Type your reply to this user..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="mt-3 flex justify-end">
                    <button disabled={replySending} onClick={sendReply} className={`px-4 py-2 rounded text-white ${replySending ? 'bg-primary/70' : 'bg-primary hover:bg-primaryDark'}`}>
                      {replySending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking details modal */}
        <BookingModal open={bookingModalOpen} onClose={() => setBookingModalOpen(false)} booking={selectedBooking} />
      </div>
    </div>
  )
};



export default AdminDashboard;
