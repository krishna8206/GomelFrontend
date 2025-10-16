import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiAward, FiHeart } from 'react-icons/fi';

const About = () => {
  const values = [
    {
      icon: <FiTarget className="text-4xl text-[#00C8B3]" />,
      title: 'Our Mission',
      description: 'To revolutionize car rentals by providing seamless, affordable, and premium mobility solutions for every journey.'
    },
    {
      icon: <FiEye className="text-4xl text-[#00C8B3]" />,
      title: 'Our Vision',
      description: 'To be India\'s most trusted car rental platform, connecting travelers with the perfect vehicles for their adventures.'
    },
    {
      icon: <FiAward className="text-4xl text-[#00C8B3]" />,
      title: 'Our Excellence',
      description: 'We maintain the highest standards in vehicle quality, customer service, and user experience across all touchpoints.'
    },
    {
      icon: <FiHeart className="text-4xl text-[#00C8B3]" />,
      title: 'Our Promise',
      description: 'Complete transparency, fair pricing, and 24/7 support to ensure your journey is smooth and memorable.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Premium Cars' },
    { number: '50+', label: 'Cities' },
    { number: '10K+', label: 'Happy Customers' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-7xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            About <span className="text-[#00C8B3]">GOMEL CARS</span>
          </h1>
          <p className="text-muted text-lg max-w-3xl mx-auto">
            India's premier car rental platform, connecting travelers with quality vehicles since 2020
          </p>
        </motion.div>

      

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center bg-white rounded-xl p-6 border border-primary/20 shadow-sm"
            >
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</p>
              <p className="text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Our <span className="text-[#00C8B3]">Story</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm max-w-4xl mx-auto"
          >
            <p className="text-muted leading-relaxed mb-4">
              Founded in 2020, GOMEL CARS emerged from a simple idea: car rentals should be easy, transparent, and accessible to everyone. We noticed the challenges people faced when trying to rent a vehicle - from limited options to hidden fees and complicated processes.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              Our team of passionate individuals set out to create a platform that would transform the car rental experience. We built relationships with trusted car owners across India, implemented rigorous quality checks, and developed a user-friendly platform that puts customers first.
            </p>
            <p className="text-muted leading-relaxed">
              Today, GOMEL CARS serves thousands of customers across 50+ cities, offering a diverse fleet of over 500 premium vehicles. Our commitment to excellence, transparency, and customer satisfaction continues to drive us forward as we expand our services and enhance the travel experience for all.
            </p>
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              What We <span className="text-[#00C8B3]">Stand For</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 border border-primary/20 hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-3">{value.title}</h3>
                <p className="text-muted leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-white rounded-2xl p-12 border border-primary/20 text-center shadow-sm"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Join Our Journey
          </h2>
          <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
            Whether you're looking to rent a car for your next adventure or share your vehicle with others, GOMEL CARS is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/cars"
              className="px-8 py-3 bg-primary hover:bg-[#00C8B3] text-white font-bold rounded-lg transition-all"
            >
              Browse Cars
            </a>
            <a
              href="/host"
              className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              Become a Host
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
