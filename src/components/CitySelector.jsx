import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiKey, FiMapPin, FiShield, FiClock, FiDollarSign, FiChevronRight } from 'react-icons/fi';

const CitySelector = () => {
  const steps = [
    { icon: <FiKey />, title: 'Book Instantly', desc: 'Reserve your car in minutes with instant confirmation.' },
    { icon: <FiMapPin />, title: 'Pickup Anywhere', desc: 'Doorstep delivery or nearest pickup point—your choice.' },
    { icon: <FiShield />, title: 'Drive Confident', desc: 'Well-maintained cars with verified hosts and support.' },
  ];
  const stats = [
    { value: '10K+', label: 'Happy Riders' },
    { value: '500+', label: 'Premium Cars' },
    { value: '50+', label: 'Cities Covered' },
  ];

  return (
    <section id="discover" className="relative py-20 px-4 bg-background overflow-hidden">
      <span className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#1F7AE0]/10 blur-3xl" />
      <span className="pointer-events-none absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-[#00C8B3]/10 blur-3xl" />
      <div className="max-w-7xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-primary">Plan. <span className="text-[#00C8B3]">Pick.</span> Drive.</h2>
          <p className="text-muted text-lg mt-2">A smoother way to rent—designed around your journey.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl p-[1px] bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3]">
              <div className="bg-white rounded-2xl p-6 h-full">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] text-white flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-muted">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-14">
          {stats.map((st, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-primary/20">
              <p className="text-3xl font-extrabold text-primary">{st.value}</p>
              <p className="text-muted">{st.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3]">
          <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-primary">Ready to roll?</h3>
              <p className="text-muted">Browse our premium fleet and start your trip today.</p>
            </div>
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] text-white font-semibold shadow-sm hover:shadow-md hover:shadow-[#00C8B3]/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Cars <FiChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CitySelector;
