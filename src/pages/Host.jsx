import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMapPin, FiUsers, FiZap, FiSettings, FiDollarSign, FiImage } from 'react-icons/fi';
import { useCars } from '../context/CarContext';
import { useAuth } from '../context/AuthContext';

const Host = () => {
  const { user, token } = useAuth();
  const { addCar, cars, removeCar, hostBookings, getHostBookings, requestPayout } = useCars();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: 'SUV',
    city: 'Mumbai',
    seats: 5,
    fuel: 'Petrol',
    transmission: 'Manual',
    pricePerDay: '',
    image: '',
    imageData: '',
    description: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load host bookings when user + token present
  useEffect(() => {
    if (user && token) getHostBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, imageData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const carData = {
          ...formData,
          pricePerDay: parseInt(formData.pricePerDay),
          seats: parseInt(formData.seats),
          hostId: user?.id
        };
        await addCar(carData);
        setSuccess(true);
        setTimeout(() => navigate('/cars'), 1500);
      } catch (err) {
        alert(err?.message || 'Failed to list car');
      }
    })();
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl p-8 border border-primary/20 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Car Listed Successfully!</h2>
          <p className="text-muted">Your car has been added to our platform</p>
        </motion.div>
      </div>
    );
  }

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Goa', 'Hyderabad', 'Chennai', 'Kolkata'];
  const types = ['SUV', 'Hatchback', 'Sedan', 'Electric'];
  const fuels = ['Petrol', 'Diesel', 'Electric'];
  const transmissions = ['Manual', 'Automatic'];

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-4xl mx-auto py-12">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-primary mb-4">My Listings</h2>
            <div className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm">
              {cars.filter((c) => c.hostId === user.id).length === 0 ? (
                <p className="text-muted">You have not listed any cars yet.</p>
              ) : (
                <div className="space-y-4">
                  {cars
                    .filter((c) => c.hostId === user.id)
                    .map((c) => (
                      <div key={c.id} className="flex items-center gap-4 border border-primary/20 rounded-lg p-3">
                        <img src={c.image} alt={c.name} className="w-24 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-semibold text-text">{c.name}</p>
                          <p className="text-sm text-muted">{c.brand} • {c.city} • ₹{c.pricePerDay}/day</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/cars/${c.id}`, '_self')}
                            className="px-3 py-2 bg-white border border-primary/30 text-text rounded-lg hover:border-primary"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              const ok = window.confirm('Remove this car from your listings?');
                              if (!ok) return;
                              const done = removeCar(c.id);
                              if (!done) alert('Failed to remove.');
                            }}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-primary mb-4">My Bookings (as Host)</h2>
            <div className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm">
              {hostBookings.length === 0 ? (
                <p className="text-muted">No bookings for your cars yet.</p>
              ) : (
                <div className="space-y-3">
                  {hostBookings.map((b) => (
                    <div key={b.id} className="border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-text">Booking #{b.id}</p>
                        <p className="text-sm text-muted">Car ID: {b.carId} • Days: {b.days} • Total: ₹{b.totalCost}</p>
                        <p className="text-sm text-muted">{b.pickupDate} to {b.returnDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              // Simple rule: request full amount for now
                              await requestPayout(b.id, b.totalCost, `Payout for booking #${b.id}`);
                              alert('Payout request submitted');
                            } catch (e) {
                              alert(e.message || 'Failed to request payout');
                            }
                          }}
                          className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark"
                        >
                          Request Payment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            List Your <span className="text-[#00C8B3]">Car</span>
          </h1>
          <p className="text-muted text-lg">
            Start earning by sharing your car with others
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-primary font-medium mb-2 flex items-center gap-2">
                  <FiTruck className="text-primaryDark" />
                  Car Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Hyundai Creta"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-primary font-medium mb-2 flex items-center gap-2">
                  <FiTruck className="text-primaryDark" />
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Hyundai"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-primary font-medium mb-2 block">Car Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-primary font-medium mb-2 flex items-center gap-2">
                  <FiMapPin className="text-primaryDark" />
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-primary font-medium mb-2 flex items-center gap-2">
                  <FiUsers className="text-primaryDark" />
                  Seats
                </label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  min="2"
                  max="8"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-primary font-medium mb-2 flex items-center gap-2">
                  <FiZap className="text-primaryDark" />
                  Fuel Type
                </label>
                <select
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                >
                  {fuels.map((fuel) => (
                    <option key={fuel} value={fuel}>
                      {fuel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-primary font-medium mb-2 flex items-center gap-2">
                  <FiSettings className="text-primaryDark" />
                  Transmission
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                >
                  {transmissions.map((trans) => (
                    <option key={trans} value={trans}>
                      {trans}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-primary font-medium mb-2 flex items-center gap-2">
                <FiDollarSign className="text-primaryDark" />
                Price Per Day (₹)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                placeholder="e.g., 2000"
                min="500"
                className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-primary font-medium mb-2 flex items-center gap-2">
                <FiImage className="text-primaryDark" />
                Car Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
              />
              {(formData.imageData || formData.image) && (
                <img
                  src={formData.imageData || formData.image}
                  alt="preview"
                  className="mt-3 h-40 object-cover rounded border"
                />
              )}
            </div>

            <div>
              <label className="text-primary font-medium mb-2 block">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your car's features and condition..."
                rows="4"
                className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary resize-none"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-primary hover:bg-[#00C8B3] text-white font-bold rounded-lg transition-all"
            >
              List Your Car
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Host;
