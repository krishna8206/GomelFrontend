import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiShield, FiSmartphone, FiCheckCircle } from 'react-icons/fi';
import { useCars } from '../context/CarContext';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking } = useCars();
  const { user } = useAuth();
  const bookingFromState = location.state?.booking;

  const [method, setMethod] = useState('upi'); // 'upi' | 'card'
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  // Form states
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const totalCost = useMemo(() => bookingFromState?.totalCost || 0, [bookingFromState]);

  useEffect(() => {
    if (!bookingFromState) {
      navigate('/cars');
    }
  }, [bookingFromState, navigate]);

  if (!bookingFromState) return null;

  const validate = () => {
    if (method === 'upi') {
      // simple UPI regex user@handle
      return /.+@.+/.test(upiId.trim());
    } else {
      const num = card.number.replace(/\s+/g, '');
      const okNum = /^\d{16}$/.test(num);
      const okName = card.name.trim().length >= 2;
      const okExpiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(card.expiry.trim());
      const okCvv = /^\d{3}$/.test(card.cvv.trim());
      return okNum && okName && okExpiry && okCvv;
    }
  };

  const formatCard = (val) => {
    return val.replace(/[^\d]/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const handlePay = async () => {
    if (!validate()) return;
    setProcessing(true);
    // simulate gateway
    await new Promise((r) => setTimeout(r, 1500));
    const pid = 'PAY' + Math.floor(100000 + Math.random() * 900000);
    setPaymentId(pid);

    // persist booking now
    const saved = addBooking({
      ...bookingFromState,
      userId: user?.id,
      payment: {
        id: pid,
        method,
        upiId: method === 'upi' ? upiId : undefined,
        cardLast4: method === 'card' ? card.number.slice(-4) : undefined,
        status: 'success',
      },
    });

    setPaid(true);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-5xl mx-auto py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-primary mb-8 text-center"
        >
          Secure <span className="text-primaryDark">Payment</span>
        </motion.h1>

        {paid ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm text-center"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">Payment Successful</h2>
            <p className="text-muted mb-6">Your booking has been confirmed.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-6">
              <div className="bg-white rounded-xl p-4 border border-primary/20">
                <p className="text-muted text-sm">Payment ID</p>
                <p className="font-semibold">{paymentId}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-primary/20">
                <p className="text-muted text-sm">Amount</p>
                <p className="font-semibold">₹{totalCost}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-primary/20">
                <p className="text-muted text-sm">Method</p>
                <p className="font-semibold capitalize">{method}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate('/cars')}
                className="px-6 py-3 bg-white text-text border border-primary/30 rounded-lg hover:border-primary"
              >
                Browse More Cars
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-2xl p-8 border border-primary/20 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-primary mb-6">Select Payment Method</h2>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMethod('upi')}
                  className={`px-4 py-2 rounded-lg border ${
                    method === 'upi' ? 'bg-primary text-white border-primary' : 'bg-white text-text border-primary/30'
                  }`}
                >
                  <FiSmartphone className="inline mr-2" /> UPI
                </button>
                <button
                  onClick={() => setMethod('card')}
                  className={`px-4 py-2 rounded-lg border ${
                    method === 'card' ? 'bg-primary text-white border-primary' : 'bg-white text-text border-primary/30'
                  }`}
                >
                  <FiCreditCard className="inline mr-2" /> Card
                </button>
              </div>

              {method === 'upi' ? (
                <div className="space-y-4">
                  <label className="text-primary font-medium mb-2 flex items-center gap-2">
                    <FiSmartphone className="text-primaryDark" /> Enter UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="username@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-primary font-medium mb-2 flex items-center gap-2">
                    <FiCreditCard className="text-primaryDark" /> Card Details
                  </label>
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Name on Card"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: validate() ? 1.02 : 1 }}
                  whileTap={{ scale: validate() ? 0.98 : 1 }}
                  disabled={!validate() || processing}
                  onClick={handlePay}
                  className={`w-full py-4 font-bold rounded-lg transition-all ${
                    validate() && !processing ? 'bg-primary text-white hover:bg-primaryDark' : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {processing ? 'Processing...' : `Pay ₹${totalCost}`}
                </motion.button>
                <p className="text-muted text-sm mt-3 flex items-center gap-2">
                  <FiShield className="text-primary" /> Payments are encrypted and secure.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm"
            >
              <h3 className="text-xl font-bold text-primary mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Car</span>
                  <span className="font-semibold">{bookingFromState.carName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Price per day</span>
                  <span className="font-semibold">₹{(bookingFromState.totalCost / bookingFromState.days).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Days</span>
                  <span className="font-semibold">{bookingFromState.days}</span>
                </div>
                <div className="border-t border-primary/20 pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalCost}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
