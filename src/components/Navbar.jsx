import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { isAdmin, logoutAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cars', path: '/cars' },
    { name: 'Host Your Car', path: '/host' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white  backdrop-blur-md border-b border-[#00C8B3]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold"
            >
              <span className="text-[#1F7AE0] ">GOMEL</span>
              <span className="text-[#00C8B3]"> CARS</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex  items-center space-x-8">
            {!isAdmin && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className=" text-[#1F7AE0]  hover:text-[#00C8B3] transition-colors duration-300 font-bold"
              >
                {link.name}
              </Link>
            ))}

            {(user || isAdmin) ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-[#1F7AE0] hover:text-[#00C8B3] transition-colors"
                >
                  <FiUser className="text-xl" />
                  <span className="font-medium">{isAdmin ? 'Admin' : (user.fullName || user.email?.split('@')[0])}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-[#0A0F2C] border border-[#00C8B3]/30 rounded-lg shadow-xl overflow-hidden"
                    >
                      {isAdmin ? (
                        <>
                          
                          <button
                            onClick={() => { logoutAdmin(); setShowUserMenu(false); navigate('/'); }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-[#00C8B3]/10 flex items-center space-x-2"
                          >
                            <span>Admin Logout</span>
                          </button>
                          <div className="h-px bg-[#00C8B3]/20" />
                        </>
                      ) : null}
                      {user && (
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-white hover:bg-[#00C8B3]/10 flex items-center space-x-2"
                        >
                          <FiLogOut />
                          <span>Logout</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] text-white font-semibold shadow-sm hover:shadow-md hover:shadow-[#00C8B3]/40 hover:-translate-y-0.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8B3]/60"
              >
                <FiUser className="text-[18px]" />
                <span>Login</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary text-2xl"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-primary/20"
          >
            <div className="px-4 py-4 space-y-3">
              {!isAdmin && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-text hover:text-primary transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}

              {(user || isAdmin) ? (
                <>
                  <div className="border-t border-primary/20 pt-3">
                    <p className="text-primary font-medium mb-2">
                      {isAdmin ? 'Admin' : (user.fullName || user.email?.split('@')[0])}
                    </p>
                    {/* Admin quick actions in mobile */}
                    {isAdmin ? (
                      <div className="space-y-2 mb-2">
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="w-full block px-4 py-2 bg-primary text-white rounded-lg text-center hover:bg-primaryDark"
                        >
                          Admin Dashboard
                        </Link>
                        <button
                          onClick={() => { logoutAdmin(); setIsOpen(false); navigate('/'); }}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Admin Logout
                        </button>
                        <div className="h-px bg-primary/20" />
                      </div>
                    ) : null}
                    {user && (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1F7AE0] to-[#00C8B3] text-white font-semibold text-center shadow-sm hover:shadow-md hover:shadow-[#00C8B3]/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8B3]/60"
                >
                  <FiUser className="text-[18px]" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
