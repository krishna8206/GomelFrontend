import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Gomel3 from "../Gomel3.jpg";
import { useCity } from "../context/CityContext";
import CityModal from "./CityModal";
import { useCars } from "../context/CarContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const slides = [
    {
      title: "Get discounted prices on 7+ days bookings",
      subtitle: "Zoomcar Subscription",
      img: "",
      features: ["Top-rated cars", "Flexible return", "Priority Support"],
    },
    {
      title: "Book Self-Drive Cars Anytime",
      subtitle: "Daily Drives up to 7 days",
      img: "",
      features: ["No hidden fees", "24/7 Support", "Unlimited Km Options"],
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const { selectedCity } = useCity();
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const { cars } = useCars();
  const navigate = useNavigate();

  // Search form state
  const [location, setLocation] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [delivery, setDelivery] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pickupType, setPickupType] = useState('text');
  const [dropoffType, setDropoffType] = useState('text');
  const [searchError, setSearchError] = useState("");

  // Build suggestion list from current cars (unique cities + brands + names)
  const suggestions = useMemo(() => {
    const set = new Set();
    cars.forEach(c => {
      if (c.city) set.add(c.city);
      if (c.brand) set.add(c.brand);
      if (c.name) set.add(c.name);
    });
    return Array.from(set);
  }, [cars]);

  const filteredSuggestions = useMemo(() => {
    const q = (location || "").toLowerCase().trim();
    if (!q) return [];
    return suggestions
      .filter(s => s.toLowerCase().includes(q))
      .filter(s => s.toLowerCase() !== q) // do not show exact match
      .slice(0, 6);
  }, [location, suggestions]);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <>
    <div
    className="relative flex flex-col md:flex-row items-center justify-between px-4 md:px-20 bg-cover md:bg-contain bg-center md:bg-[right_15%_center] bg-no-repeat py-10 md:h-[80vh] w-full mt-12"
    style={{ backgroundImage: `url(${Gomel3})` }}
  >
    {/* Decorative background shapes */}
    <span className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    <span className="pointer-events-none absolute right-10 -bottom-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
  
    {/* Decorative plus signs */}
    <div className="pointer-events-none absolute inset-0 opacity-20">
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 text-[#ffffff20] text-4xl">+</div>
      <div className="absolute left-2/3 top-1/2 text-[#ffffff20] text-2xl">+</div>
      <div className="absolute left-1/3 top-2/3 text-[#ffffff20] text-3xl">+</div>
    </div>
  
  
      {/* Left Search Card */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-none md:w-[520px] mx-auto md:mx-0 z-10 border border-primary/10"
      >
        <div className="flex border-b mb-4">
          <button className="flex-1 text-center py-2 border-b-2 border-[#00C8B3]  text-primary font-semibold text-sm sm:text-base">
            Daily Drives
          </button>
          <button className="flex-1 text-center text-[#00C8B3]  py-2 font-semibold relative text-sm sm:text-base">
            Subscription
            <span className="text-[10px] sm:text-xs text-red-500 absolute -top-2 right-2 sm:-top-1 sm:right-6">
              New
            </span>
          </button>
        </div>

        <h2 className="text-lg font-medium text-primary mb-2">
          Looking for Best Car Rentals?
        </h2>
        <h1 className="text-xl sm:text-2xl text-primary font-bold mb-4">
          Book Self-Drive Cars in{" "}
          <span
            className="text-[#00C8B3] cursor-pointer underline-offset-4 hover:underline"
            onClick={() => setCityModalOpen(true)}
          >
            {selectedCity || "Select City"}
          </span>
        </h1>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search city, brand or car name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                }
              }}
              className="w-full bg-white border border-primary/30 rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-primary/20 rounded-lg shadow" role="listbox">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      // MouseDown fires before input blur, so selection is captured
                      e.preventDefault();
                      setLocation(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <input
              type={pickupType}
              placeholder="dd-mm-yyyy --:--"
              value={pickup}
              onFocus={(e)=>{ setPickupType('datetime-local'); if (e.target.showPicker) { try { e.target.showPicker(); } catch {} } }}
              onBlur={(e)=>{ if (!e.target.value) setPickupType('text'); }}
              onChange={(e) => setPickup(e.target.value)}
              {...(pickupType === 'datetime-local' ? { min: new Date().toISOString().slice(0,16) } : {})}
              className="flex-1 min-w-0 w-full bg-white border border-primary/30 rounded-lg px-3 sm:px-4 py-2 text-text focus:outline-none focus:border-primary"
            />
            <input
              type={dropoffType}
              placeholder="dd-mm-yyyy --:--"
              value={dropoff}
              onFocus={(e)=>{ setDropoffType('datetime-local'); if (e.target.showPicker) { try { e.target.showPicker(); } catch {} } }}
              onBlur={(e)=>{ if (!e.target.value) setDropoffType('text'); }}
              onChange={(e) => setDropoff(e.target.value)}
              {...(dropoffType === 'datetime-local' ? { min: pickup || new Date().toISOString().slice(0,16) } : {})}
              className="flex-1 min-w-0 w-full bg-white border border-primary/30 rounded-lg px-3 sm:px-4 py-2 text-text focus:outline-none focus:border-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" checked={delivery} onChange={(e)=>setDelivery(e.target.checked)} />
            Delivery & Pick-up, from anywhere
          </label>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              // Determine whether location is a city or free text
              const cityList = Array.from(new Set(cars.map(c => c.city).filter(Boolean)));
              const citiesLower = new Map(cityList.map(c => [c.toLowerCase(), c]));
              const loc = (location || '').trim();
              const isCity = loc && citiesLower.has(loc.toLowerCase());
              // If user typed text and it's not a city, do NOT force selectedCity; let keyword search be broad
              let cityToUse = '';
              if (loc) {
                cityToUse = isCity ? (citiesLower.get(loc.toLowerCase()) || loc) : '';
              } else if (selectedCity) {
                // Only apply selectedCity when no free-text search entered
                // Normalize casing if present in dataset
                cityToUse = citiesLower.get(selectedCity.toLowerCase()) || selectedCity;
              }
              // --- Validation: require a city or keyword AND both pickup & return dates ---
              const hasCityOrKeyword = !!cityToUse || !!loc;
              const hasDates = !!pickup && !!dropoff;
              const datesValid = hasDates ? (new Date(dropoff) > new Date(pickup)) : false;
              if (!hasCityOrKeyword || !hasDates || !datesValid) {
                let msg = '';
                if (!hasCityOrKeyword) msg = 'Please select a city or enter a location.';
                else if (!hasDates) msg = 'Please choose both pickup and return dates.';
                else if (!datesValid) msg = 'Return date must be after pickup date.';
                setSearchError(msg);
                return;
              }
              setSearchError('');
              if (cityToUse) params.set('city', cityToUse);
              if (loc && !isCity) params.set('q', loc);
              if (pickup) params.set('pickup', pickup);
              if (dropoff) params.set('return', dropoff);
              if (delivery) params.set('delivery', '1');
              setShowSuggestions(false);
              navigate(`/cars?${params.toString()}`);
            }}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-md hover:shadow-[#00C8B3]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8B3]/60"
          >
            SEARCH
          </button>
          {searchError && (
            <p className="mt-2 text-sm text-red-500">{searchError}</p>
          )}
        </div>
      </motion.div>

    </div>
    <CityModal open={cityModalOpen} onClose={() => setCityModalOpen(false)} />
    </>
  );
};

export default Hero;

