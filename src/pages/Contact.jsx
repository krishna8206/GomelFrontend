import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';
import { useCars } from '../context/CarContext';

const Contact = () => {
  const { submitContactForm } = useCars();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        await submitContactForm(formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 3000);
      } catch (err) {
        alert(err?.message || 'Failed to send message');
      }
    })();
  };

  const contactInfo = [
    {
      icon: <FiMapPin className="text-2xl text-[#00C8B3]" />,
      title: 'Visit Us',
      details: ['123 Business District', 'Mumbai, Maharashtra 400001', 'India']
    },
    {
      icon: <FiPhone className="text-2xl text-[#00C8B3]" />,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 98765 43211', 'Mon-Sun: 24/7']
    },
    {
      icon: <FiMail className="text-2xl text-[#00C8B3]" />,
      title: 'Email Us',
      details: ['info@gomelcars.com', 'support@gomelcars.com', 'We reply within 24 hours']
    }
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
            Get in <span className="text-[#00C8B3]">Touch</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all text-center shadow-sm"
            >
              <div className="flex justify-center mb-4">{info.icon}</div>
              <h3 className="text-xl font-bold text-primary mb-3">{info.title}</h3>
              {info.details.map((detail, i) => (
                <p key={i} className="text-muted text-sm">
                  {detail}
                </p>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiMessageSquare className="text-3xl text-primary" />
              <h2 className="text-2xl font-bold text-primary">Send Us a Message</h2>
            </div>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400"
              >
                Message sent successfully! We'll get back to you soon.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-primary font-medium mb-2 block">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-primary font-medium mb-2 block">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-primary font-medium mb-2 block">Your Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows="6"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all resize-none"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-primary hover:bg-[#00C8B3] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <FiSend />
                Send Message
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl p-8 border border-primary/20 h-full shadow-sm">
              <h2 className="text-2xl font-bold text-primary mb-6">Find Us Here</h2>

              <div className="relative w-full h-96 rounded-xl overflow-hidden mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709433!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1647000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="rounded-xl"
                ></iframe>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-primary/20 rounded-lg p-4">
                  <h3 className="text-primary font-bold mb-2">Business Hours</h3>
                  <p className="text-muted text-sm">Open 24/7 for your convenience</p>
                  <p className="text-muted text-sm mt-1">Customer support available round the clock</p>
                </div>

                <div className="bg-white border border-primary/20 rounded-lg p-4">
                  <h3 className="text-primary font-bold mb-2">Response Time</h3>
                  <p className="text-muted text-sm">We typically respond within 2-4 hours</p>
                  <p className="text-muted text-sm mt-1">Emergency support available immediately</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl p-8 border border-primary/20 text-center shadow-sm"
        >
          <h3 className="text-2xl font-bold text-primary mb-3">Need Immediate Assistance?</h3>
          <p className="text-muted mb-6">
            Our customer support team is available 24/7 to help you with any queries or emergencies.
          </p>
          <a
            href="tel:+919876543210"
            className="inline-block px-8 py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-lg transition-all"
          >
            Call Now: +91 98765 43210
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
