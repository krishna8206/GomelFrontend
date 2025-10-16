import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useCity } from '../context/CityContext';

const POPULAR_CITIES = [
  'Bangalore',
  'Chennai',
  'Delhi NCR',
  'Jaipur',
  'Hyderabad',
  'Mumbai',
  'Vizag',
  'Kolkata',
  'Goa',
  'Pune',
  'Ahmedabad',
  'Surat',
  'Indore',
  'Chandigarh',
  'Lucknow',
  'Noida',
  'Gurugram',
  'Nagpur',
];

const CityModal = ({ open, onClose }) => {
  const { selectedCity, setSelectedCity } = useCity();
  const [query, setQuery] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = showMore ? POPULAR_CITIES : POPULAR_CITIES.slice(0, 10);
    if (!q) return base;
    return base.filter((c) => c.toLowerCase().includes(q));
  }, [query, showMore]);

  if (!open) return null;

  const handleSelect = (city) => {
    setSelectedCity(city);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-[95%] max-w-2xl rounded-xl shadow-2xl border border-primary/20 p-6">
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted hover:text-text"
        >
          <FiX className="text-2xl" />
        </button>

        <h3 className="text-2xl md:text-3xl font-bold text-text text-center mb-4">Choose City</h3>

        {/* Search */}
        <div className="flex items-center gap-2 border border-primary/30 rounded-lg px-3 py-2 mb-6">
          <FiSearch className="text-primary text-xl" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for city"
            className="flex-1 outline-none text-text placeholder:text-muted"
          />
        </div>

        {/* Top Cities */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex-1 h-px bg-primary/20" />
            <span className="text-muted">Top Cities</span>
            <span className="flex-1 h-px bg-primary/20" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
            {filtered.map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className={`border rounded-lg px-3 py-2 text-sm transition-colors hover:border-primary ${
                  selectedCity === city ? 'border-primary text-primary' : 'border-primary/20 text-text'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowMore((s) => !s)}
              className="text-primary hover:text-primaryDark font-medium"
            >
              {showMore ? 'View Less' : 'View More'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityModal;
