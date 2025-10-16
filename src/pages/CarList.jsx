import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCars } from '../context/CarContext';
import CarCard from '../components/CarCard';
import CarFilterBar from '../components/CarFilterBar';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://updatedgomelbackend.onrender.com/api';

const CarList = () => {
  const [searchParams] = useSearchParams();
  const { cars } = useCars();
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [availability, setAvailability] = useState({}); // id -> boolean
  const getMaxPrice = (arr) => {
    const vals = (arr || []).map(c => Number(c.pricePerDay) || 0);
    const m = vals.length ? Math.max(...vals) : 0;
    // round up to nearest 1000 for nicer slider caps
    return m > 0 ? Math.ceil(m / 1000) * 1000 : 100000;
  };
  const [filters, setFilters] = useState(() => ({
    city: searchParams.get('city') || '',
    type: '',
    transmission: '',
    fuel: '',
    minPrice: 0,
    maxPrice: getMaxPrice([])
  }));
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    applyFiltersAndSort();
  }, [cars, filters, sortBy, searchQuery, availability]);

  // When cars dataset changes, ensure maxPrice cap is not too low
  useEffect(() => {
    const cap = getMaxPrice(cars);
    setFilters(prev => ({ ...prev, maxPrice: Math.max(prev.maxPrice || 0, cap) }));
  }, [cars]);

  // Keep in sync with URL changes from Hero search
  useEffect(() => {
    const city = searchParams.get('city') || '';
    const q = searchParams.get('q') || '';
    const pickup = searchParams.get('pickup') || '';
    const ret = searchParams.get('return') || '';
    setFilters(prev => ({ ...prev, city }));
    setSearchQuery(q);
    // pickup/return/delivery can be used later for availability windows; stored for future
    // Fetch availability when both dates are present
    (async () => {
      if (pickup && ret) {
        try {
          const params = new URLSearchParams({ pickup, return: ret });
          if (city) params.set('city', city);
          const res = await fetch(`${API_BASE}/cars/availability?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            const map = {};
            data.forEach((r) => { map[String(r.id)] = !!r.availableForRange; });
            setAvailability(map);
          } else {
            setAvailability({});
          }
        } catch {
          setAvailability({});
        }
      } else {
        setAvailability({});
      }
    })();
  }, [searchParams]);

  const applyFiltersAndSort = () => {
    let result = [...cars];

    if (filters.city) {
      result = result.filter(car => car.city === filters.city);
    }
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(car =>
        (car.name || '').toLowerCase().includes(q) ||
        (car.brand || '').toLowerCase().includes(q) ||
        (car.city || '').toLowerCase().includes(q)
      );
    }
    if (filters.type) {
      result = result.filter(car => car.type === filters.type);
    }
    if (filters.transmission) {
      result = result.filter(car => car.transmission === filters.transmission);
    }
    if (filters.fuel) {
      result = result.filter(car => car.fuel === filters.fuel);
    }
    result = result.filter(car => car.pricePerDay >= (filters.minPrice || 0) && car.pricePerDay <= filters.maxPrice);

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      // Use numeric id as a proxy for recency if available
      result.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    }

    // annotate with availabilityForRange if known
    const annotated = result.map(c => (
      Object.prototype.hasOwnProperty.call(availability, String(c.id))
        ? { ...c, availableForRange: availability[String(c.id)] }
        : c
    ));

    // sort available-for-range first if availability present
    const anyAvailInfo = annotated.some(c => typeof c.availableForRange === 'boolean');
    if (anyAvailInfo) {
      annotated.sort((a, b) => {
        const avA = a.availableForRange === true ? 1 : 0;
        const avB = b.availableForRange === true ? 1 : 0;
        if (avA !== avB) return avB - avA; // available first
        return 0;
      });
    }

    setFilteredCars(annotated);
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-7xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Browse Our <span className="text-[#00C8B3]">Premium Fleet</span>
          </h1>
          <p className="text-muted text-lg">
            Find the perfect car for your journey
          </p>
        </motion.div>

        <CarFilterBar
          onFilterChange={setFilters}
          onSortChange={setSortBy}
          initialFilters={filters}
          initialSortBy={sortBy}
        />

        {filteredCars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted text-xl">No cars found matching your criteria</p>
            <p className="text-muted mt-2">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 text-text">
              <p className="text-lg">
                Showing <span className="text-primary font-bold">{filteredCars.length}</span> cars
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 

export default CarList;
