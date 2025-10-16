import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { motion} from 'framer-motion';
const Footer = () => {
  return (
    <footer className="bg-background border-t border-primary/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold"
              >
                <span className="text-[#1F7AE0] ">GOMEL</span>
                <span className="text-[#00C8B3]"> CARS</span>
              </motion.div>
            </Link>
            <p className="text-muted mb-4">
              Your trusted partner for premium car rentals. Rent smart, drive easy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#00C8B3] hover:text-primaryDark transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-[#00C8B3] hover:text-primaryDark transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-[#00C8B3] hover:text-primaryDark transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-[#00C8B3] hover:text-primaryDark transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-text font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-muted hover:text-primary transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/host" className="text-muted hover:text-primary transition-colors">
                  Host Your Car
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-muted hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-primary transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text font-bold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted">
                <FiMapPin className="text-primary" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <FiPhone className="text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <FiMail className="text-primary" />
                <span>info@gomelcars.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-8">
          <p className="text-center text-muted font-bold">
            © {new Date().getFullYear()} GOMEL CARS. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
