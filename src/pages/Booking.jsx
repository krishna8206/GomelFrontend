import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUser, FiMail, FiPhone, FiCreditCard, FiUpload, FiShield, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useCars } from '../context/CarContext';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCarById, addBooking } = useCars();
  const { user, loading } = useAuth();
  const car = getCarById(id);

  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: car?.city || '',
    returnLocation: car?.city || ''
  });

  // Verification State
  const [verificationData, setVerificationData] = useState({
    idType: 'Aadhaar',
    idNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    issuingState: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState({ idFront: null, idBack: null, license: null });
  const [uploadedPreviews, setUploadedPreviews] = useState({ idFront: null, idBack: null, license: null });
  const [isVerified, setIsVerified] = useState(false);
  const [verifyErrors, setVerifyErrors] = useState([]);

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Helpers to persist preview data for admin view
  const toDataUrl = (file) => new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (key, file) => {
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
    const dataUrl = await toDataUrl(file);
    setUploadedPreviews((prev) => ({ ...prev, [key]: dataUrl }));
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background flex items-center justify-center">
        <div className="text-center text-text">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-text mb-4">Car not found</h2>
        </div>
      </div>
    );
  }

  const calculateDays = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0;
    const pickup = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);
    const diffTime = Math.abs(returnDate - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();
  const totalCost = days * car.pricePerDay;

  // Simple validators (client-side mock verification)
  const validateGovId = (type, value) => {
    if (!value) return false;
    const v = value.trim().toUpperCase();
    switch (type) {
      case 'Aadhaar':
        // 12 digits (not doing full Verhoeff here)
        return /^\d{12}$/.test(v);
      case 'PAN':
        // 5 letters + 4 digits + 1 letter
        return /^[A-Z]{5}\d{4}[A-Z]$/.test(v);
      case 'Passport':
        // Simple: 1 letter + 7 digits (IN format often is 1 letter 7 digits)
        return /^[A-Z]{1}\d{7}$/.test(v);
      case 'Driving License':
        // Common Indian DL format sample: 2 letters state + 2 digits RTO + year + serial
        return /^[A-Z]{2}\d{2}\d{4}\d{7}$/.test(v) || /^[A-Z]{2}-\d{2}-\d{6,11}$/.test(v);
      default:
        return v.length > 3;
    }
  };

  const validateLicense = (licenseNumber, expiry) => {
    if (!licenseNumber || !expiry) return false;
    const okFormat = /[A-Z0-9-]{6,20}/i.test(licenseNumber.trim());
    const todayStr = new Date().toISOString().split('T')[0];
    const notExpired = expiry > todayStr;
    return okFormat && notExpired;
  };

  const handleVerifyDocuments = (e) => {
    if (e) e.preventDefault();
    const errs = [];
    if (!validateGovId(verificationData.idType, verificationData.idNumber)) {
      errs.push('Enter a valid government ID number for the selected type.');
    }
    if (!validateLicense(verificationData.licenseNumber, verificationData.licenseExpiry)) {
      errs.push('Enter a valid driving license number and a future expiry date.');
    }
    if (!uploadedFiles.idFront || !uploadedFiles.license) {
      errs.push('Please upload at least ID front and License image/PDF.');
    }
    setVerifyErrors(errs);
    const pass = errs.length === 0;
    setIsVerified(pass);
    return pass;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Block submission until verification is successful
    if (!isVerified) {
      handleVerifyDocuments();
      return;
    }

    const booking = {
      userId: user.id,
      userName: user.fullName || '',
      userEmail: user.email || '',
      carId: car.id,
      carName: car.name,
      carImage: car.image,
      ...bookingData,
      verification: {
        ...verificationData,
        isVerified: true,
        attachments: {
          idFront: !!uploadedFiles.idFront,
          idBack: !!uploadedFiles.idBack,
          license: !!uploadedFiles.license
        },
        attachmentsData: {
          idFront: uploadedPreviews.idFront,
          idBack: uploadedPreviews.idBack,
          license: uploadedPreviews.license
        }
      },
      totalCost,
      days
    };

    // Go to Payment page with booking context
    navigate('/payment', { state: { booking } });
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-2xl p-8 border border-primary/20 shadow-sm"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">Booking Confirmed!</h2>
            <p className="text-muted">Your car rental has been successfully booked</p>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 border border-primary/20">
            <div className="mb-4">
              <p className="text-muted text-sm">Booking ID</p>
              <p className="text-primary font-bold text-xl">#{bookingId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-text">
              <div>
                <p className="text-muted text-sm">Car</p>
                <p className="font-semibold">{car.name}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Total Cost</p>
                <p className="font-semibold text-primary">₹{totalCost}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Pickup Date</p>
                <p className="font-semibold">{bookingData.pickupDate}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Return Date</p>
                <p className="font-semibold">{bookingData.returnDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
            <p className="text-text text-sm">
              A confirmation email has been sent to <span className="font-semibold">{user.email}</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary hover:bg-primaryDark text-white font-bold rounded-lg transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen pt-20 px-4 bg-background text-text">
      <div className="max-w-6xl mx-auto py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-primary mb-8 text-center"
        >
          Complete Your <span className="text-[#00C8B3]">Booking</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 border border-primary/20 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-primary mb-6">Booking Details</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-primary font-medium mb-2 flex items-center gap-2">
                      <FiCalendar className="text-primaryDark" />
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.pickupDate}
                      onChange={(e) => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                      min={today}
                      className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-primary font-medium mb-2 flex items-center gap-2">
                      <FiCalendar className="text-primaryDark" />
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.returnDate}
                      onChange={(e) => setBookingData({ ...bookingData, returnDate: e.target.value })}
                      min={bookingData.pickupDate || today}
                      className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-primary font-medium mb-2 flex items-center gap-2">
                      <FiMapPin className="text-primaryDark" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={bookingData.pickupLocation}
                      onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-primary font-medium mb-2 flex items-center gap-2">
                      <FiMapPin className="text-primaryDark" />
                      Return Location
                    </label>
                    <input
                      type="text"
                      value={bookingData.returnLocation}
                      onChange={(e) => setBookingData({ ...bookingData, returnLocation: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-primary/20 pt-6">
                  <h3 className="text-xl font-bold text-primary mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiUser className="text-primaryDark" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.fullName || ''}
                        className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiMail className="text-primaryDark" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Identity & License Verification */}
                <div className="border-t border-primary/20 pt-6">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <FiShield className="text-primaryDark" /> Identity & License Verification
                  </h3>

                  {isVerified ? (
                    <div className="flex items-center gap-2 mb-4 text-green-400">
                      <FiCheckCircle />
                      <span>Documents verified. You can proceed to payment.</span>
                    </div>
                  ) : (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 text-primary flex items-start gap-2">
                      <FiAlertTriangle className="mt-0.5" />
                      <span>Upload valid government ID and driving license, then click Verify.</span>
                    </div>
                  )}

                  {verifyErrors.length > 0 && (
                    <ul className="mb-4 text-red-400 list-disc list-inside">
                      {verifyErrors.map((er, idx) => (
                        <li key={idx}>{er}</li>
                      ))}
                    </ul>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiShield className="text-primaryDark" />
                        Government ID Type
                      </label>
                      <select
                        value={verificationData.idType}
                        onChange={(e) => setVerificationData({ ...verificationData, idType: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                      >
                        <option>Aadhaar</option>
                        <option>PAN</option>
                        <option>Passport</option>
                        <option>Driving License</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiShield className="text-primaryDark" />
                        Government ID Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter ID number"
                        value={verificationData.idNumber}
                        onChange={(e) => setVerificationData({ ...verificationData, idNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="md:col-span-2">
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiCreditCard className="text-primaryDark" />
                        Driving License Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., GJ05 2021 1234567"
                        value={verificationData.licenseNumber}
                        onChange={(e) => setVerificationData({ ...verificationData, licenseNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0F2C] border border-[#00C8B3]/30 rounded-lg text-white focus:outline-none focus:border-[#00C8B3]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiCalendar className="text-primaryDark" />
                        License Expiry
                      </label>
                      <input
                        type="date"
                        value={verificationData.licenseExpiry}
                        min={today}
                        onChange={(e) => setVerificationData({ ...verificationData, licenseExpiry: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0F2C] border border-[#00C8B3]/30 rounded-lg text-white focus:outline-none focus:border-[#00C8B3]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiUpload className="text-primaryDark" />
                        Upload ID (Front)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="idFrontFile"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('idFront', e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                        <label
                          htmlFor="idFrontFile"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-primary/40 text-text hover:border-primary hover:shadow hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
                        >
                          <FiUpload className="text-primary" />
                          <span>Choose File</span>
                        </label>
                        <span
                          className="text-sm text-muted truncate max-w-[10rem] md:max-w-[12rem] lg:max-w-[16rem]"
                          title={uploadedFiles.idFront ? uploadedFiles.idFront.name : 'No file chosen'}
                        >
                          {uploadedFiles.idFront ? uploadedFiles.idFront.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiUpload className="text-primaryDark" />
                        Upload ID (Back)
                      </label>
                      <div className="flex items-center">
                        <input
                          id="idBackFile"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('idBack', e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                        <label
                          htmlFor="idBackFile"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-primary/40 text-text hover:border-primary hover:shadow hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
                        >
                          <FiUpload className="text-primary" />
                          <span>Choose File</span>
                        </label>
                        <span
                          className="text-sm text-muted truncate max-w-[10rem] md:max-w-[12rem] lg:max-w-[16rem]"
                          title={uploadedFiles.idBack ? uploadedFiles.idBack.name : 'No file chosen'}
                        >
                          {uploadedFiles.idBack ? uploadedFiles.idBack.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-primary font-medium mb-2 flex items-center gap-2">
                        <FiUpload className="text-primaryDark" />
                        Upload License
                      </label>
                      <div className="flex items-center">
                        <input
                          id="licenseFile"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange('license', e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                        <label
                          htmlFor="licenseFile"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-primary/40 text-text hover:border-primary hover:shadow hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
                        >
                          <FiUpload className="text-primary" />
                          <span>Choose File</span>
                        </label>
                        <span
                          className="text-sm text-muted truncate max-w-[10rem] md:max-w-[12rem] lg:max-w-[16rem]"
                          title={uploadedFiles.license ? uploadedFiles.license.name : 'No file chosen'}
                        >
                          {uploadedFiles.license ? uploadedFiles.license.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleVerifyDocuments}
                      className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold transition-all ${
                        isVerified
                          ? 'bg-green-600 text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {isVerified ? 'Verified' : 'Verify Documents'}
                    </motion.button>
                  </div>
                </div>

                <div className="border-t border-primary/20 pt-6">
                  <h3 className="text-xl font-bold text-primary mb-4">Payment Information</h3>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                    <p className="text-text text-sm">
                      <FiCreditCard className="inline mr-2 text-primary" />
                      Payment will be processed securely
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!isVerified}
                  className={`w-full py-4 font-bold rounded-lg transition-all ${
                    isVerified
                      ? 'bg-primary text-white hover:bg-primaryDark'
                      : 'bg-gray-500 text-white cursor-not-allowed opacity-70'
                  }`}
                >
                  {isVerified ? `Confirm Booking & Pay ₹${totalCost}` : 'Verify to Continue'}
                </motion.button>
              </div>
            </motion.form>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-primary/20 sticky top-24 shadow-sm"
            >
              <h3 className="text-xl font-bold text-primary mb-6">Booking Summary</h3>

              <img
                src={car.image}
                alt={car.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text">
                  <span className="text-muted">Car</span>
                  <span className="font-semibold">{car.name}</span>
                </div>
                <div className="flex justify-between text-text">
                  <span className="text-muted">Price per day</span>
                  <span className="font-semibold">₹{car.pricePerDay}</span>
                </div>
                <div className="flex justify-between text-text">
                  <span className="text-muted">Number of days</span>
                  <span className="font-semibold">{days} {days === 1 ? 'day' : 'days'}</span>
                </div>
              </div>

              <div className="border-t border-primary/20 pt-4">
                <div className="flex justify-between text-text text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalCost}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
