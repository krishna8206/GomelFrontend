import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiUser, FiPhone } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, requestOtp, verifyOtp, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [pendingOtp, setPendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [otpDigits, setOtpDigits] = useState(Array(4).fill(''));
  const otpRefs = useRef([]);

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    if (val && idx < 3) otpRefs.current[idx + 1]?.focus();
  };

  // If already authenticated, redirect away from signup
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 3) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (!text) return;
    e.preventDefault();
    const next = Array(4).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtpDigits(next);
    otpRefs.current[Math.min(text.length, 3)]?.focus();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!pendingOtp) {
        // Validate inputs before sending OTP
        const res = await requestOtp(formData.email, 'signup');
        if (!res.success) throw new Error(res.error);
        setPendingOtp(true);
        
      } else {
        const code = otpDigits.join('');
        if (code.length !== 4) throw new Error('Enter 4-digit OTP');
        setOtpCode(code);
        const { error } = await verifyOtp({
          email: formData.email,
          code,
          fullName: formData.fullName,
          mobile: formData.mobile
        });
        if (error) setError(error); else navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google signup removed

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Join GOMEL <span className="text-[#00C8B3]">CARS</span></h1>
            <p className="text-muted">Create your account to get started</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="text-primary font-medium mb-2 block">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-primary font-medium mb-2 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-primary font-medium mb-2 block">Mobile</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {pendingOtp && (
              <div>
                <label className="text-primary font-medium mb-2 block">Enter 4-digit OTP</label>
                <div className="flex gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 text-center text-lg bg-white border border-primary/30 rounded-lg focus:outline-none focus:border-primary"
                      required
                    />
                  ))}
                </div>
                
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-[#00C8B3] text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (pendingOtp ? 'Verifying...' : 'Sending OTP...') : (pendingOtp ? 'Verify OTP' : 'Sign Up')}
            </motion.button>
          </form>

          {/* Third-party signups removed */}

          <p className="text-center text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
