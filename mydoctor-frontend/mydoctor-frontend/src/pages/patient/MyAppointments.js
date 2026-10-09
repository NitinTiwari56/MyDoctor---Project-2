import React, { useEffect, useState } from 'react';
import { getPatientAppts, cancelAppointment } from '../../services/api';
import { CalendarCheck, Clock, Home, MapPin, AlertTriangle, X, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const s = status.toLowerCase();
  return (
    <span
      className={`badge badge-${s}`}
      style={{
        animation: s === 'pending' ? 'pulse 2s ease-in-out infinite' : undefined,
      }}
    >
      {s === 'pending' && <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: 'currentColor', display: 'inline-block',
      }} />}
      {status}
    </span>
  );
}

/* ── Custom Confirmation Modal ── */
function ConfirmModal({ message, onConfirm, onClose, loading }) {
  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal"
        style={{ maxWidth: 400 }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(244,63,94,.1), rgba(251,113,133,.06))',
            border: '1px solid rgba(244,63,94,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
          }}>
            <AlertTriangle size={26} style={{ color: '#f43f5e' }} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.2rem',
            color: 'var(--navy)', marginBottom: 8,
          }}>
            Cancel Appointment?
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '.87rem', lineHeight: 1.5 }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <motion.button
              className="btn btn-secondary btn-full"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Keep it
            </motion.button>
            <motion.button
              className="btn btn-danger btn-full"
              onClick={onConfirm}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="spinner" /> : 'Yes, cancel'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const statusColors = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  COMPLETED: '#6366f1',
  CANCELLED: '#94a3b8',
  REJECTED: '#f43f5e',
};

export default function MyAppointments() {
  const [appts, setAppts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]     = useState(false);

  const load = () => {
    setLoading(true);
    getPatientAppts().then(r => setAppts(r.data.data || [])).catch(() => setAppts([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelTarget);
      toast.success('Appointment cancelled');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally { setCancelling(false); }
  };

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'];
  const filtered = filter === 'ALL' ? appts : appts.filter(a => a.status === filter);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">My Appointments</div>
          <div className="topbar-subtitle">{appts.length} total appointments</div>
        </div>
      </div>

      <div className="page">
        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`tab-btn ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t}
              {t !== 'ALL' && (
                <span style={{
                  fontSize: '.68rem', fontWeight: 650,
                  background: filter === t ? 'rgba(99,102,241,.1)' : 'var(--gray-100)',
                  color: filter === t ? 'var(--indigo)' : 'var(--gray-400)',
                  padding: '1px 6px', borderRadius: 99, marginLeft: 5,
                  transition: 'all .2s',
                }}>
                  {appts.filter(a => a.status === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 70 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CalendarCheck size={44} />
            <h3>No appointments</h3>
            <p>No {filter.toLowerCase()} appointments found.</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  className="card"
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  layout
                  style={{
                    borderLeft: `3px solid ${statusColors[a.status] || '#94a3b8'}`,
                  }}
                >
                  <div className="card-body" style={{ padding: '20px 24px' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', flexWrap: 'wrap', gap: 14,
                    }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        {/* Doctor Avatar */}
                        <div style={{
                          width: 46, height: 46, borderRadius: 10,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontFamily: 'var(--font-display)',
                          fontSize: '.95rem', flexShrink: 0,
                          boxShadow: '0 3px 12px rgba(99,102,241,.25)',
                        }}>
                          {a.doctorName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.02rem', color: 'var(--navy)',
                          }}>
                            Dr. {a.doctorName}
                          </div>
                          <div style={{
                            fontSize: '.76rem', color: 'var(--indigo)',
                            fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '.05em',
                          }}>
                            {a.doctorSpecialization}
                          </div>

                          {/* Meta info */}
                          <div style={{
                            display: 'flex', gap: 14, marginTop: 10,
                            fontSize: '.8rem', color: 'var(--gray-500)', flexWrap: 'wrap',
                          }}>
                            {a.appointmentDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CalendarCheck size={13} />
                                {format(new Date(a.appointmentDate), 'dd MMM yyyy')}
                              </span>
                            )}
                            {a.startTime && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} />
                                {a.startTime.slice(0, 5)}
                              </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {a.appointmentType === 'HOME_VISIT'
                                ? <><Home size={13} />Home Visit</>
                                : <><MapPin size={13} />Clinic Visit</>}
                            </span>
                          </div>

                          {a.reasonForVisit && (
                            <div style={{
                              marginTop: 10, fontSize: '.8rem', color: 'var(--gray-400)',
                              display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                              📋 {a.reasonForVisit}
                            </div>
                          )}

                          {a.doctorNotes && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                marginTop: 8, fontSize: '.8rem',
                                background: 'linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.04))',
                                color: 'var(--indigo)',
                                padding: '8px 12px', borderRadius: 8,
                                border: '1px solid rgba(99,102,241,.1)',
                              }}
                            >
                              💊 {a.doctorNotes}
                            </motion.div>
                          )}

                          {a.rejectionReason && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                marginTop: 8, fontSize: '.8rem',
                                background: 'linear-gradient(135deg, rgba(244,63,94,.06), rgba(251,113,133,.03))',
                                color: 'var(--red)',
                                padding: '8px 12px', borderRadius: 8,
                                border: '1px solid rgba(244,63,94,.1)',
                              }}
                            >
                              ❌ {a.rejectionReason}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Right side: status + actions */}
                      <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-end', gap: 10,
                      }}>
                        <StatusBadge status={a.status} />
                        {a.paymentStatus && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: '.68rem', fontWeight: 600,
                            padding: '3px 8px', borderRadius: 6,
                            background: a.paymentStatus === 'PAID'
                              ? 'rgba(16,185,129,.08)' : 'rgba(245,158,11,.08)',
                            color: a.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                            border: `1px solid ${a.paymentStatus === 'PAID'
                              ? 'rgba(16,185,129,.15)' : 'rgba(245,158,11,.15)'}`,
                          }}>
                            <CreditCard size={11} />
                            {a.paymentStatus === 'PAID' ? 'Paid' : 'Payment Pending'}
                          </span>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(a.status) && (
                          <motion.button
                            className="btn btn-danger btn-sm"
                            onClick={() => setCancelTarget(a.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X size={13} /> Cancel
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <ConfirmModal
            message="This action cannot be undone. The appointment will be cancelled and your doctor will be notified."
            onConfirm={handleCancel}
            onClose={() => setCancelTarget(null)}
            loading={cancelling}
          />
        )}
      </AnimatePresence>
    </>
  );
}
