import { useEffect, useRef, useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import { useCity } from '../context/CityContext';
import { useCars } from '../context/CarContext';

const CarFilterBar = ({ onFilterChange, onSortChange, initialFilters, initialSortBy }) => {
  const { selectedCity } = useCity();
  const { cars } = useCars();
  const [filters, setFilters] = useState({
    city: selectedCity || '',
    type: '',
    transmission: '',
    fuel: '',
    minPrice: 0,
    maxPrice: 5000
  });

  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const didInitCity = useRef(false);

  const cities = Array.from(new Set((cars || []).map((c) => c.city))).sort();
  const types = ['SUV', 'Hatchback', 'Sedan', 'Electric'];
  const transmissions = ['Manual', 'Automatic'];
  const fuels = ['Petrol', 'Diesel', 'Electric'];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange(value);
  };

  const resetFilters = () => {
    const defaultFilters = {
      city: selectedCity || '',
      type: '',
      transmission: '',
      fuel: '',
      minPrice: 0,
      maxPrice: 5000
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    onSortChange('');
  };

  useEffect(() => {
    const hasInitial = !!initialFilters && (initialFilters.city || initialFilters.type || initialFilters.transmission || initialFilters.fuel || typeof initialFilters.minPrice === 'number' || typeof initialFilters.maxPrice === 'number');
    if (hasInitial) return; // Respect parent-provided filters from URL; do not override on mount

    // Initialize city once if filter empty; only set if city exists in dataset
    if (
      !didInitCity.current &&
      selectedCity &&
      !filters.city &&
      cities.includes(selectedCity)
    ) {
      const newFilters = { ...filters, city: selectedCity };
      setFilters(newFilters);
      onFilterChange(newFilters);
      didInitCity.current = true;
    }
    // If current city filter is not available in dataset anymore, clear it
    if (filters.city && !cities.includes(filters.city)) {
      const newFilters = { ...filters, city: '' };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, filters.city, didInitCity, cities.join(','), initialFilters]);

  // Sync from parent when CarList passes initial state (e.g., from URL or previous selection)
  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  useEffect(() => {
    if (initialSortBy !== undefined) {
      setSortBy(initialSortBy || '');
    }
  }, [initialSortBy]);

  return (
    <div className="bg-white rounded-xl p-5 md:p-6 border border-primary/20 mb-8 shadow-sm">
      {/* custom CSS for range */}
      <style>{`
          input[type="range"] {
            appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: #facc15; /* yellow-400 track */
            outline: none;
          }
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #1F7AE0; /* blue thumb */
            border: 2px solid white;
            cursor: pointer;
            margin-top: -3.5px;
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #f59e0b;
            border: 2px solid white;
            cursor: pointer;
          }
        `}</style>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FiSliders className="text-[#00C8B3] text-xl" />
          <h3 className="text-text font-bold text-lg">Filters & Sort</h3>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden px-4 py-2 bg-primary text-white rounded-lg font-semibold"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="px-4 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            className="px-4 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Transmissions</option>
            {transmissions.map((trans) => (
              <option key={trans} value={trans}>
                {trans}
              </option>
            ))}
          </select>

          <select
            value={filters.fuel}
            onChange={(e) => handleFilterChange('fuel', e.target.value)}
            className="px-4 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
          >
            <option value="">All Fuels</option>
            {fuels.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="text-text font-medium mb-2 block">
            Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-muted text-sm">Min</span>
              <input
                type="number"
                min="0"
                max={filters.maxPrice}
                step="100"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', Math.max(0, Math.min(Number(e.target.value) || 0, filters.maxPrice)))}
                className="w-full px-3 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
              />
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
            />
            <div className="flex items-center gap-2">
              <span className="text-muted text-sm">Max</span>
              <input
                type="number"
                min={filters.minPrice}
                max="5000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', Math.max(filters.minPrice, Math.min(Number(e.target.value) || 0, 5000)))}
                className="w-full px-3 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="flex-1 px-4 h-11 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
          >
            <option value="">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          <button
            onClick={resetFilters}
            className="sm:w-auto w-full px-6 h-11 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarFilterBar;
