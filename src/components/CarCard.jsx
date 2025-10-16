import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiZap, FiSettings, FiStar, FiMapPin } from 'react-icons/fi';

const CarCard = ({ car }) => {
  const hasRange = typeof car.availableForRange === 'boolean';
  const isAvailFlag = hasRange ? car.availableForRange : car.available;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-[#00C8B3]/50 hover:border-[#00C8B3]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00C8B3]/20"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-[#0A0F2C]/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <FiStar className="text-[#00C8B3] text-sm" />
          <span className="text-white font-semibold text-sm">{car.rating}</span>
        </div>
        <div className="absolute top-4 left-4 bg-[#00C8B3] text-[#0A0F2C] px-3 py-1 rounded-full text-xs font-bold">
          {car.type}
        </div>
        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${isAvailFlag ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}`}>
          {hasRange ? (isAvailFlag ? 'Available for dates' : 'Not available for dates') : (isAvailFlag ? 'Available' : 'Not Available')}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <FiMapPin className="text-[#1F7AE0]" />
          <span>{car.city}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{car.brand}</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiUsers className="text-[#1F7AE0]" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiZap className="text-[#1F7AE0]" />
            <span>{car.fuel}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiSettings className="text-[#1F7AE0]" />
            <span>{car.transmission}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#00C8B3]/20">
          <div>
            <p className="text-gray-400 text-xs">Per Day</p>
            <p className="text-2xl font-bold text-[#1F7AE0]">₹{car.pricePerDay}</p>
          </div>
          <Link
            to={`/cars/${car.id}`}
            className={`px-6 py-2 font-bold rounded-lg transition-all duration-300 ${isAvailFlag ? 'bg-[#1F7AE0] text-white hover:shadow-lg hover:shadow-[#1F7AE0]/50' : 'bg-gray-500 text-white cursor-not-allowed opacity-80'}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CarCard;
