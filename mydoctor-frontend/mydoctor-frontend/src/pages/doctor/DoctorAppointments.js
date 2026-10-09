import React, { useEffect, useState } from 'react';
import { getDoctorAppts, confirmAppt, rejectAppt, completeAppt } from '../../services/api';
import { CalendarClock, Clock, Home, MapPin, CheckCircle, XCircle, Award, X, AlertTriangle } from 'lucide-react';
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

function NotesModal({ title, placeholder, icon, iconColor, iconBg, onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(text);
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
    >
      <motion.div
        className="modal"
        style={{ maxWidth: 440 }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: iconBg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {icon}
            </div>
            <h3>{title}</h3>
          </div>
          <motion.button
            className="modal-close"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={18} />
          </motion.button>
        </div>
        <div className="modal-body">
          <textarea
            className="form-textarea"
            placeholder={placeholder}
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ minHeight: 110 }}
          />
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
              onClick={handleConfirm}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="spinner" /> : 'Confirm'}
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

export default function DoctorAppointments() {
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [modal, setModal]     = useState(null);
  const [busy, setBusy]       = useState(null);

  const load = () => {
    setLoading(true);
    getDoctorAppts().then(r => setAppts(r.data.data || [])).catch(() => setAppts([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleConfirm = async (id) => {
    setBusy(id);
    try {
      await confirmAppt(id);
      toast.success('Appointment confirmed ✓');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setBusy(null); }
  };

  const handleReject = async (reason) => {
    setBusy(modal.apptId);
    try {
      await rejectAppt(modal.apptId, { rejectionReason: reason });
      toast.success('Appointment rejected');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setBusy(null); }
  };

  const handleComplete = async (notes) => {
    setBusy(modal.apptId);
    try {
      await completeAppt(modal.apptId, { doctorNotes: notes });
      toast.success('Marked as completed! 🎉');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setBusy(null); }
  };

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? appts : appts.filter(a => a.status === filter);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Appointments</div>
          <div className="topbar-subtitle">{appts.length} total</div>
        </div>
      </div>

      <div className="page">
        {/* Tabs with count badges */}
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
            <CalendarClock size={44} />
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
                        {/* Patient Avatar */}
                        <div style={{
                          width: 46, height: 46, borderRadius: 10,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontFamily: 'var(--font-display)',
                          fontSize: '.95rem', flexShrink: 0,
                          boxShadow: '0 3px 12px rgba(99,102,241,.25)',
                        }}>
                          {a.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.02rem', color: 'var(--navy)',
                          }}>
                            {a.patientName}
                          </div>
                          <div style={{ fontSize: '.76rem', color: 'var(--gray-400)', marginTop: 2 }}>
                            {a.patientPhone}
                          </div>

                          <div style={{
                            display: 'flex', gap: 14, marginTop: 10,
                            fontSize: '.8rem', color: 'var(--gray-500)', flexWrap: 'wrap',
                          }}>
                            {a.appointmentDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CalendarClock size={13} />
                                {format(new Date(a.appointmentDate), 'dd MMM yyyy')}
                              </span>
                            )}
                            {a.startTime && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} />{a.startTime.slice(0, 5)}
                              </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {a.appointmentType === 'HOME_VISIT'
                                ? <><Home size={13} />Home — {a.patientAddress}</>
                                : <><MapPin size={13} />Clinic Visit</>}
                            </span>
                          </div>

                          {a.reasonForVisit && (
                            <div style={{ marginTop: 10, fontSize: '.8rem', color: 'var(--gray-400)' }}>
                              📋 Reason: {a.reasonForVisit}
                            </div>
                          )}
                          {a.symptoms && (
                            <div style={{ fontSize: '.8rem', color: 'var(--gray-400)', marginTop: 3 }}>
                              🩺 Symptoms: {a.symptoms}
                            </div>
                          )}

                          {a.rejectionReason && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                marginTop: 8, fontSize: '.8rem',
                                background: 'linear-gradient(135deg, rgba(244,63,94,.06), rgba(251,113,133,.03))',
                                color: 'var(--red)', padding: '8px 12px',
                                borderRadius: 8, border: '1px solid rgba(244,63,94,.1)',
                              }}
                            >
                              ❌ Rejected: {a.rejectionReason}
                            </motion.div>
                          )}
                          {a.doctorNotes && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                marginTop: 8, fontSize: '.8rem',
                                background: 'linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.04))',
                                color: 'var(--indigo)', padding: '8px 12px',
                                borderRadius: 8, border: '1px solid rgba(99,102,241,.1)',
                              }}
                            >
                              💊 Notes: {a.doctorNotes}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-end', gap: 10,
                      }}>
                        <StatusBadge status={a.status} />
                        <div className="action-row">
                          {a.status === 'PENDING' && <>
                            <motion.button
                              className="btn btn-sm btn-primary"
                              disabled={busy === a.id}
                              onClick={() => handleConfirm(a.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {busy === a.id
                                ? <span className="spinner" />
                                : <><CheckCircle size={13} />Confirm</>}
                            </motion.button>
                            <motion.button
                              className="btn btn-sm btn-danger"
                              onClick={() => setModal({ type: 'reject', apptId: a.id })}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <XCircle size={13} />Reject
                            </motion.button>
                          </>}
                          {a.status === 'CONFIRMED' && (
                            <motion.button
                              className="btn btn-sm btn-outline"
                              onClick={() => setModal({ type: 'complete', apptId: a.id })}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Award size={13} />Complete
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'reject' && (
          <NotesModal
            title="Reject Appointment"
            placeholder="Reason for rejection (optional)..."
            icon={<XCircle size={20} style={{ color: '#f43f5e' }} />}
            iconBg="linear-gradient(135deg, rgba(244,63,94,.1), rgba(251,113,133,.06))"
            onConfirm={handleReject}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.type === 'complete' && (
          <NotesModal
            title="Complete Appointment"
            placeholder="Add doctor's notes / prescription..."
            icon={<Award size={20} style={{ color: '#6366f1' }} />}
            iconBg="linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.06))"
            onConfirm={handleComplete}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
