import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // used only for admin
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOtp, requestOtp, user: currentUser } = useAuth();
  const { loginAdmin, ADMIN_EMAIL } = useAdmin();
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

  // If already authenticated, do not show Login; redirect to home
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!pendingOtp) {
        const normEmail = (email || '').trim().toLowerCase();
        // Basic email validation
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail);
        if (!emailOk) {
          setError('Please enter a valid email address');
          return;
        }
        if (normEmail === (ADMIN_EMAIL || '').toLowerCase()) {
          // Admin path: password-only
          if (!password) {
            setError('Admin password is required');
            return;
          }
          const adminResult = await loginAdmin(email, password);
          if (!adminResult.error) {
            navigate('/admin', { replace: true });
            return;
          }
          // If admin creds wrong, show error and do not fall through to user OTP
          throw new Error(adminResult.error || 'Invalid admin credentials');
        }

        // User path (passwordless): request OTP
        const res = await requestOtp(email, 'login');
        if (!res.success) {
          setError(res.error || 'Unable to send OTP');
          return;
        }
        setPendingOtp(true);
      } else {
        // Verify OTP to complete login
        const code = otpDigits.join('');
        if (code.length !== 4) throw new Error('Enter 4-digit OTP');
        if (!email) {
          setError('Email is required');
          return;
        }
        setOtpCode(code);
        const { error } = await verifyOtp({ email, code });
        if (error) setError(error); else navigate('/', { replace: true });
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login removed

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted">Login to continue your journey</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="text-primary font-medium mb-2 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>
            {!pendingOtp && (email.trim().toLowerCase() === (ADMIN_EMAIL || '').toLowerCase()) && (
              <div>
                <label className="text-primary font-medium mb-2 block">Admin Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-12 pr-12 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            )}

            {/* Admin is auto-detected by attempting admin login first; no toggle needed */}

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
            {/* Forgot password removed */}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-[#00C8B3] text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading
                ? (pendingOtp
                    ? 'Verifying...'
                    : (email.trim().toLowerCase() === (ADMIN_EMAIL || '').toLowerCase() ? 'Logging in...' : 'Sending OTP...'))
                : (pendingOtp ? 'Verify OTP' : 'Login')}
            </motion.button>
          </form>

          {/* Third-party logins removed */}

          <p className="text-center text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
