import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset, confirmPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (!res.success) throw new Error(res.error || 'Failed to request OTP');
      setOtpSent(true);
      if (res.devCode) setDevOtp(res.devCode);
      setSuccess('OTP sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error } = await confirmPasswordReset({ email, code: otpCode, newPassword });
      if (error) throw new Error(error);
      setSuccess('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Forgot Password</h1>
            <p className="text-muted">Reset your password using OTP</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">{success}</div>
          )}

          {!otpSent ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-primary font-medium mb-2 block">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-lg">
                {loading ? 'Sending...' : 'Send OTP'}
              </motion.button>
              <p className="text-center text-sm text-muted">Remembered password? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-primary font-medium mb-2 block">OTP Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
                {devOtp && <p className="text-xs text-muted mt-1">Dev OTP: {devOtp}</p>}
              </div>
              <div>
                <label className="text-primary font-medium mb-2 block">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-primary font-medium mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-lg">
                {loading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
