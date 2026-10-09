import React, { useEffect, useState, useCallback } from 'react';
import { getAllDoctors, searchDoctors, getAvailableSlots, bookAppointment, createPaymentOrder, verifyPayment } from '../../services/api';
import { Search, MapPin, Home, Clock, X, ChevronRight, Star, Briefcase, ShieldCheck, Award, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
  hover: {
    y: -6,
    boxShadow: '0 20px 50px rgba(99,102,241,.15), 0 8px 20px rgba(0,0,0,.08)',
    transition: { duration: 0.25 },
  },
};

function DoctorCard({ doc, onBook, index }) {
  const cleanName = (doc.fullName || '').replace(/^Dr\.?\s*/i, '');
  const initials = cleanName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'DR';
  const displayName = doc.fullName?.startsWith('Dr.') ? doc.fullName : `Dr. ${doc.fullName}`;
  const rating = (4 + ((doc.doctorProfileId || 1) % 10) / 10).toFixed(1);

  return (
    <motion.div
      className="doctor-card"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={() => onBook(doc)}
      layout
    >
      {/* Gradient accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
        borderRadius: '14px 14px 0 0',
        opacity: 0, transition: 'opacity .25s',
      }} className="accent-bar" />

      <div className="doctor-card-header">
        <div>
          {doc.profilePictureUrl ? (
            <img
              src={doc.profilePictureUrl}
              alt={displayName}
              onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
              style={{
                width: 54, height: 54, borderRadius: 'var(--radius-sm)',
                objectFit: 'cover', flexShrink: 0,
                boxShadow: '0 4px 14px rgba(99,102,241,.25)',
                border: '2px solid rgba(99,102,241,.15)',
              }}
            />
          ) : null}
          <div className="doctor-avatar" style={{ display: doc.profilePictureUrl ? 'none' : 'flex' }}>
            {initials}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="doctor-name">{displayName}</div>
          <div className="doctor-spec">{doc.specialization}</div>
          <div className="doctor-exp">
            <Briefcase size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
            {doc.experienceYears} yrs experience · {doc.qualifications}
          </div>
          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} style={{
                color: i < Math.floor(rating) ? '#f59e0b' : '#e2e8f0',
                fill: i < Math.floor(rating) ? '#f59e0b' : 'none',
              }} />
            ))}
            <span style={{ fontSize: '.7rem', color: 'var(--gray-400)', marginLeft: 3, fontWeight: 600 }}>
              {rating}
            </span>
          </div>
        </div>
      </div>

      <div className="doctor-meta">
        {doc.clinicAddress && (
          <span className="doctor-meta-item">
            <MapPin size={12} />{doc.clinicAddress}
          </span>
        )}
        {doc.acceptsHomeVisits && (
          <span className="doctor-meta-item" style={{ color: 'var(--teal)', fontWeight: 550 }}>
            <Home size={12} />Home visits
          </span>
        )}
      </div>

      <div className="doctor-fee">
        <div className="fee-badge">
          <div className="fee-label">Clinic</div>
          <div className="fee-value">₹{doc.consultationFeeClinic}</div>
        </div>
        {doc.acceptsHomeVisits && (
          <div className="fee-badge">
            <div className="fee-label">Home Visit</div>
            <div className="fee-value">₹{doc.consultationFeeHome}</div>
          </div>
        )}
      </div>

      <motion.button
        className="btn btn-outline btn-full"
        style={{ marginTop: 16 }}
        onClick={e => { e.stopPropagation(); onBook(doc); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Book Appointment <ChevronRight size={15} />
      </motion.button>
    </motion.div>
  );
}


function BookingModal({ doctor, onClose, onSuccess }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [type, setType]         = useState('CLINIC_VISIT');
  const [date, setDate]         = useState(today);
  const [slots, setSlots]       = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason]     = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [address, setAddress]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'paying' | 'success'

  // Calculate fee based on type
  const fee = type === 'HOME_VISIT' ? doctor.consultationFeeHome : doctor.consultationFeeClinic;

  useEffect(() => {
    if (type === 'CLINIC_VISIT') {
      setLoadingSlots(true);
      getAvailableSlots(doctor.doctorProfileId, date)
        .then(r => setSlots(r.data.data || []))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
    setSelectedSlot(null);
  }, [date, type, doctor.doctorProfileId]);

  const openRazorpayCheckout = useCallback((orderData) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MyDoctor',
        description: orderData.description,
        order_id: orderData.orderId,
        theme: {
          color: '#6366f1',
          backdrop_color: 'rgba(0,0,0,0.6)',
        },
        prefill: {
          name: orderData.doctorName,
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled by user')),
        },
        handler: (response) => {
          resolve({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed'));
      });
      rzp.open();
    });
  }, []);

  const handlePayAndBook = async () => {
    if (type === 'CLINIC_VISIT' && !selectedSlot) return toast.error('Please select a time slot');
    if (type === 'HOME_VISIT' && !address.trim()) return toast.error('Please enter your address');
    
    setLoading(true);
    setPaymentStep('paying');
    
    try {
      // Step 1: Create Razorpay order
      const orderRes = await createPaymentOrder({
        doctorId: doctor.doctorProfileId,
        appointmentType: type,
      });
      const orderData = orderRes.data.data;

      // Step 2: Open Razorpay checkout
      const paymentResult = await openRazorpayCheckout(orderData);

      // Step 3: Verify payment on backend
      const verifyRes = await verifyPayment(paymentResult);
      if (!verifyRes.data.success) {
        throw new Error('Payment verification failed');
      }

      // Step 4: Book the appointment with payment details
      setPaymentStep('success');
      await bookAppointment({
        doctorId: doctor.doctorProfileId,
        timeSlotId: type === 'CLINIC_VISIT' ? selectedSlot : null,
        appointmentType: type,
        reasonForVisit: reason,
        symptoms,
        patientAddress: address || null,
        razorpayOrderId: paymentResult.razorpayOrderId,
        razorpayPaymentId: paymentResult.razorpayPaymentId,
      });

      toast.success('Payment successful & Appointment booked! 🎉');
      // Brief delay to show success animation
      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      setPaymentStep('form');
      const msg = err.response?.data?.message || err.message || 'Payment/Booking failed';
      if (msg !== 'Payment cancelled by user') {
        toast.error(msg);
      } else {
        toast('Payment was cancelled', { icon: '🚫' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="modal-header">
          <div>
            <h3>Book Appointment</h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '.82rem', marginTop: 4 }}>
              Dr. {doctor.fullName} · <span style={{ color: 'var(--indigo)', fontWeight: 550 }}>{doctor.specialization}</span>
            </p>
          </div>
          <motion.button
            className="modal-close"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>
        <div className="modal-body">
          <AnimatePresence mode="wait">
            {/* ── Payment Success State ── */}
            {paymentStep === 'success' && (
              <motion.div
                key="pay-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(16,185,129,.35)',
                    marginBottom: 20,
                  }}
                >
                  <CheckCircle size={36} style={{ color: 'white' }} />
                </motion.div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--gray-900)', margin: 0 }}>Payment Successful!</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', marginTop: 8 }}>
                  Your appointment is being booked...
                </p>
                <div className="spinner spinner-dark" style={{ marginTop: 16, width: 22, height: 22 }} />
              </motion.div>
            )}

            {/* ── Payment Processing State ── */}
            {paymentStep === 'paying' && paymentStep !== 'success' && (
              <motion.div
                key="pay-processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(99,102,241,.35)',
                    marginBottom: 20,
                  }}
                >
                  <CreditCard size={26} style={{ color: 'white' }} />
                </motion.div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--gray-900)', margin: 0 }}>Processing Payment</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: '.82rem', marginTop: 8 }}>
                  Complete the payment in the Razorpay window...
                </p>
              </motion.div>
            )}

            {/* ── Form State ── */}
            {paymentStep === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Type toggle */}
                <div className="form-group">
                  <label className="form-label">Appointment Type</label>
                  <div className="role-toggle">
                    <button type="button" className={`role-btn ${type === 'CLINIC_VISIT' ? 'active' : ''}`}
                      onClick={() => setType('CLINIC_VISIT')}>
                      <MapPin size={14} /> Clinic Visit
                    </button>
                    {doctor.acceptsHomeVisits && (
                      <button type="button" className={`role-btn ${type === 'HOME_VISIT' ? 'active' : ''}`}
                        onClick={() => setType('HOME_VISIT')}>
                        <Home size={14} /> Home Visit
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {type === 'CLINIC_VISIT' && (
                    <motion.div
                      key="clinic"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="form-group">
                        <label className="form-label">Select Date</label>
                        <input className="form-input" type="date" value={date} min={today}
                          max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                          onChange={e => setDate(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Available Slots</label>
                        {loadingSlots ? (
                          <div style={{ textAlign: 'center', padding: 24 }}>
                            <div className="spinner spinner-dark" />
                          </div>
                        ) : slots.length === 0 ? (
                          <p style={{ fontSize: '.82rem', color: 'var(--gray-400)', padding: '12px 0' }}>
                            No slots available for this date.
                          </p>
                        ) : (
                          <div className="slots-grid">
                            {slots.map((s, i) => (
                              <motion.div
                                key={s.id}
                                className={`slot-chip ${selectedSlot === s.id ? 'selected' : ''}`}
                                onClick={() => setSelectedSlot(s.id)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.03, duration: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                {s.startTime.slice(0, 5)}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {type === 'HOME_VISIT' && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="form-group">
                        <label className="form-label">Your Address *</label>
                        <textarea className="form-textarea" placeholder="Enter your full address for home visit..."
                          value={address} onChange={e => setAddress(e.target.value)} style={{ minHeight: 80 }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="form-group">
                  <label className="form-label">Reason for Visit</label>
                  <input className="form-input" placeholder="e.g. Regular checkup, follow-up..."
                    value={reason} onChange={e => setReason(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Symptoms (optional)</label>
                  <textarea className="form-textarea" placeholder="Describe your symptoms..."
                    value={symptoms} onChange={e => setSymptoms(e.target.value)} style={{ minHeight: 80 }} />
                </div>

                {/* Payment Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.06))',
                    border: '1px solid rgba(99,102,241,.15)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    marginTop: 8,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CreditCard size={16} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '.78rem', color: 'var(--gray-400)', fontWeight: 500 }}>Consultation Fee</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>₹{fee}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: '#10b981', fontWeight: 600 }}>
                      <Shield size={12} />
                      Secure Payment
                    </div>
                  </div>
                </motion.div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <motion.button
                    className="btn btn-secondary btn-full"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="btn btn-primary btn-full"
                    onClick={handlePayAndBook}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {loading ? <span className="spinner" /> : (
                      <>
                        <CreditCard size={16} />
                        Pay ₹{fee} & Book
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FindDoctors() {
  const [searchParams]          = useSearchParams();
  const initialKeyword          = searchParams.get('search') || searchParams.get('specialty') || '';
  const [doctors, setDoctors]   = useState([]);
  const [keyword, setKeyword]   = useState(initialKeyword);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(null);

  const load = (searchVal) => {
    const term = (searchVal !== undefined ? searchVal : keyword).trim();
    setLoading(true);
    const req = term ? searchDoctors(term) : getAllDoctors();
    req.then(r => setDoctors(r.data.data || [])).catch(() => setDoctors([])).finally(() => setLoading(false));
  };

  useEffect(() => { 
    if (initialKeyword) {
      setKeyword(initialKeyword);
      load(initialKeyword);
    } else {
      load();
    }
  }, [initialKeyword]); // eslint-disable-line

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Find Doctors</div>
          <div className="topbar-subtitle">Search by name or specialization</div>
        </div>
      </div>

      <div className="page">
        {/* Premium Search Bar */}
        <motion.div
          className="search-bar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="search-input-wrap">
            <Search size={16} />
            <input
              className="form-input search-input"
              placeholder="Search doctors, specializations..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={load}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Search size={15} /> Search
          </motion.button>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
            <p style={{ color: 'var(--gray-400)', fontSize: '.85rem', marginTop: 14 }}>Finding doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Search size={44} />
            <h3>No doctors found</h3>
            <p>Try a different search term or browse all specializations.</p>
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: 18,
          }}>
            {doctors.map((d, i) => (
              <DoctorCard key={d.doctorProfileId} doc={d} onBook={setBooking} index={i} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {booking && (
          <BookingModal
            doctor={booking}
            onClose={() => setBooking(null)}
            onSuccess={() => { setBooking(null); load(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
