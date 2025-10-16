import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FiUsers, FiZap, FiSettings, FiStar, FiMapPin, FiCheck } from 'react-icons/fi';
import { useCars } from '../context/CarContext';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCarById, cars, removeCar } = useCars();
  const { user } = useAuth();
  const car = getCarById(id);

  if (!car) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-text mb-4">Car not found</h2>
          <Link to="/cars" className="text-primary hover:underline">
            Browse all cars
          </Link>
        </div>
      </div>
    );
  }

  const relatedCars = cars
    .filter(c => c.id !== car.id && c.city === car.city)
    .slice(0, 3);

  const features = [
    'Fully Insured',
    'GPS Navigation',
    'Bluetooth Audio',
    'Air Conditioning',
    'Power Steering',
    'ABS Brakes',
    'Airbags',
    '24/7 Roadside Assistance'
  ];

  const handleBooking = () => {
    if (!car.available) return; // block when not available
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/booking/${car.id}`);
    }
  };

  const handleDelete = () => {
    if (!user) return navigate('/login');
    const ok = window.confirm('Are you sure you want to remove this car?');
    if (!ok) return;
    const done = removeCar(car.id, user.id);
    if (done) {
      navigate('/cars');
    } else {
      alert('You can only remove cars you listed.');
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-7xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12"
        >
          <div>
            <div className="mb-6">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-96 object-cover rounded-2xl"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <FiMapPin className="text-primary" />
              <span>{car.city}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {car.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-muted text-lg">{car.brand}</span>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                <FiStar className="text-primary" />
                <span className="text-primary font-semibold">{car.rating}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-primary/20 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <FiUsers className="text-[#00C8B3] text-2xl mx-auto mb-2" />
                  <p className="text-text font-semibold">{car.seats} Seats</p>
                  <p className="text-muted text-sm">Capacity</p>
                </div>
                <div className="text-center">
                  <FiZap className="text-[#00C8B3] text-2xl mx-auto mb-2" />
                  <p className="text-text font-semibold">{car.fuel}</p>
                  <p className="text-muted text-sm">Fuel Type</p>
                </div>
                <div className="text-center">
                  <FiSettings className="text-[#00C8B3] text-2xl mx-auto mb-2" />
                  <p className="text-text font-semibold">{car.transmission}</p>
                  <p className="text-muted text-sm">Transmission</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-primary mb-4">Description</h3>
              <p className="text-muted leading-relaxed">{car.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-text">
                    <FiCheck className="text-primary" />
                    <span className="text-muted">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-primary/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-muted text-sm">Rental Price</p>
                  <p className="text-4xl font-bold text-primary">
                    ₹{car.pricePerDay}
                    <span className="text-lg text-muted">/day</span>
                  </p>
                </div>
              </div>

              {!car.available && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 text-sm">
                  This car is currently not available for booking.
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBooking}
                disabled={!car.available}
                className={`w-full py-4 font-bold rounded-lg transition-all duration-300 ${car.available ? 'bg-primary hover:bg-[#00C8B3] text-white' : 'bg-gray-500 text-white cursor-not-allowed opacity-80'}`}
              >
                {car.available ? 'Book Now' : 'Not Available'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {relatedCars.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              Similar Cars in <span className="text-[#00C8B3]">{car.city}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCars.map((relatedCar) => (
                <CarCard key={relatedCar.id} car={relatedCar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetails;
