import { motion } from "framer-motion";
import Hero from "../components/Hero";
import CitySelector from "../components/CitySelector";
import CarSlider from "../components/CarSlider";
import { useCars } from "../context/CarContext";
import { FiCheckCircle, FiShield, FiClock, FiDollarSign } from "react-icons/fi";

const Home = () => {
  const { cars } = useCars();
  const featuredCars = cars.filter((car) => car.rating >= 4.5).slice(0, 6);

  const features = [
    {
      icon: <FiCheckCircle className="text-4xl text-primary" />,
      title: "Easy Booking",
      description: "Book your car in just a few clicks with our simple process",
      buttonText: "Learn More",
    },
    {
      icon: <FiShield className="text-4xl text-primary" />,
      title: "Verified Cars",
      description: "All vehicles are thoroughly inspected and verified",
      buttonText: "Learn More",
    },
    {
      icon: <FiClock className="text-4xl text-primary" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for your convenience",
      buttonText: "Learn More",
    },
    {
      icon: <FiDollarSign className="text-4xl text-primary" />,
      title: "Best Prices",
      description: "Competitive pricing with no hidden charges",
      buttonText: "Learn More",
    },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      city: "Mumbai",
      rating: 5,
      text: "Amazing service! Booked a Hyundai Creta for my family trip. The car was in perfect condition and the process was seamless.",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      name: "Priya Patel",
      city: "Bangalore",
      rating: 5,
      text: "GOMEL CARS made my business trip so convenient. Great selection of cars and professional service.",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      name: "Arjun Mehta",
      city: "Delhi",
      rating: 5,
      text: "Best car rental experience ever! The Mahindra Thar was perfect for our Goa road trip. Highly recommended!",
      image:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text">
      <Hero />
      <CitySelector />

      {featuredCars.length > 0 && (
        <div className="bg-white ">
          <CarSlider cars={featuredCars} title="Featured Premium Cars" />
        </div>
      )}

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#1F7AE0] font-bold mb-4">
              Why Choose <span className="text-[#00C8B3] ">GOMEL CARS</span>?
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Experience premium car rentals with unmatched service quality
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all duration-300 text-center shadow-md"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted mb-6">{feature.description}</p>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] text-white font-semibold shadow-sm hover:shadow-md hover:shadow-[#00C8B3]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8B3]/60">
                  {feature.buttonText}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#1F7AE0] font-bold mb-4">
              What Our <span className="text-[#00C8B3]">Customers Say</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl p-[1px] bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] hover:shadow-xl hover:shadow-[#00C8B3]/20 transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="relative bg-white rounded-2xl p-6 h-full">
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] opacity-20 blur-sm" />
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-[#00C8B3]"
                    />
                    <div>
                      <h4 className="font-bold text-text">{testimonial.name}</h4>
                      <p className="text-muted text-sm">{testimonial.city}</p>
                      <div className="flex gap-1 mt-1 text-[#00C8B3]">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted leading-relaxed">{testimonial.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
