import React, { useEffect, useState } from 'react';
import { getMySlots, createSlot, createBulkSlots, deleteSlot, blockSlot } from '../../services/api';
import { Calendar, Plus, Trash2, Lock, Clock, ChevronUp, ChevronLeft, ChevronRight, Zap, AlertTriangle } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const today = format(new Date(), 'yyyy-MM-dd');

const statusConfig = {
  AVAILABLE: { color: '#10b981', bg: 'rgba(16,185,129,.08)', label: 'Available' },
  BOOKED:    { color: '#6366f1', bg: 'rgba(99,102,241,.08)',  label: 'Booked' },
  BLOCKED:   { color: '#94a3b8', bg: 'rgba(148,163,184,.08)', label: 'Blocked' },
};

function SlotStatusDot({ status }) {
  const cfg = statusConfig[status] || { color: 'gray' };
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8,
      borderRadius: '50%', background: cfg.color,
      marginRight: 6, boxShadow: `0 0 6px ${cfg.color}40`,
    }} />
  );
}

/* ── Custom Delete Confirmation Modal ── */
function ConfirmDeleteModal({ onConfirm, onClose, loading }) {
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
        style={{ maxWidth: 380 }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 30 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(244,63,94,.1), rgba(251,113,133,.06))',
            border: '1px solid rgba(244,63,94,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={24} style={{ color: '#f43f5e' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--navy)', marginBottom: 8 }}>
            Delete this slot?
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '.85rem' }}>
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <motion.button className="btn btn-secondary btn-full" onClick={onClose}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Cancel
            </motion.button>
            <motion.button className="btn btn-danger btn-full" onClick={onConfirm} disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? <span className="spinner" /> : 'Delete'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ManageSlots() {
  const [date, setDate]           = useState(today);
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showSingle, setShowSingle] = useState(false);
  const [showBulk, setShowBulk]   = useState(false);
  const [busy, setBusy]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  // Single slot form
  const [single, setSingle] = useState({ slotDate: today, startTime: '09:00', endTime: '09:30' });

  // Bulk slot form
  const [bulk, setBulk] = useState({
    fromDate: today,
    toDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
    slotStartTime: '09:00',
    slotEndTime: '17:00',
    slotDurationMinutes: 30,
  });

  const loadSlots = () => {
    setLoading(true);
    getMySlots(date)
      .then(r => setSlots(r.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSlots(); }, [date]); // eslint-disable-line

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    try {
      await createSlot(single);
      toast.success('Slot created ✓');
      setShowSingle(false);
      if (single.slotDate === date) loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create slot');
    }
  };

  const handleCreateBulk = async (e) => {
    e.preventDefault();
    try {
      const res = await createBulkSlots(bulk);
      const count = res.data.data?.length || 0;
      toast.success(`${count} slots created! 🎉`);
      setShowBulk(false);
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create slots');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSlot(deleteTarget);
      toast.success('Slot deleted');
      setDeleteTarget(null);
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete booked slot');
    } finally { setDeleting(false); }
  };

  const handleBlock = async (id) => {
    setBusy(id);
    try {
      await blockSlot(id);
      toast.success('Slot blocked');
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block slot');
    } finally { setBusy(null); }
  };

  const grouped = { AVAILABLE: [], BOOKED: [], BLOCKED: [] };
  slots.forEach(s => { if (grouped[s.status]) grouped[s.status].push(s); });

  // Date navigation
  const goDay = (dir) => {
    const d = dir === 'prev' ? subDays(new Date(date + 'T00:00'), 1) : addDays(new Date(date + 'T00:00'), 1);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Manage Slots</div>
          <div className="topbar-subtitle">Create and manage your availability</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            className="btn btn-secondary"
            onClick={() => { setShowBulk(!showBulk); setShowSingle(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar size={15} /> Bulk Create
          </motion.button>
          <motion.button
            className="btn btn-primary"
            onClick={() => { setShowSingle(!showSingle); setShowBulk(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={15} /> Add Slot
          </motion.button>
        </div>
      </div>

      <div className="page">

        {/* ── Single Slot Form ── */}
        <AnimatePresence>
          {showSingle && (
            <motion.div
              className="card"
              style={{ marginBottom: 20 }}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-header">
                <span className="card-title">Create Single Slot</span>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowSingle(false)}>
                  <ChevronUp size={14} /> Close
                </button>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateSingle}>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input className="form-input" type="date" min={today}
                        value={single.slotDate}
                        onChange={e => setSingle(s => ({ ...s, slotDate: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Start Time</label>
                      <input className="form-input" type="time"
                        value={single.startTime}
                        onChange={e => setSingle(s => ({ ...s, startTime: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Time</label>
                      <input className="form-input" type="time"
                        value={single.endTime}
                        onChange={e => setSingle(s => ({ ...s, endTime: e.target.value }))} required />
                    </div>
                  </div>
                  <motion.button
                    className="btn btn-primary"
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={15} /> Create Slot
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bulk Slot Form ── */}
        <AnimatePresence>
          {showBulk && (
            <motion.div
              className="card"
              style={{ marginBottom: 20 }}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-header">
                <span className="card-title">Bulk Create Slots</span>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowBulk(false)}>
                  <ChevronUp size={14} /> Close
                </button>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '.83rem', color: 'var(--gray-400)', marginBottom: 18 }}>
                  Automatically generate time slots across a date range with a fixed duration.
                </p>
                <form onSubmit={handleCreateBulk}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input className="form-input" type="date" min={today}
                        value={bulk.fromDate}
                        onChange={e => setBulk(b => ({ ...b, fromDate: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input className="form-input" type="date" min={bulk.fromDate}
                        value={bulk.toDate}
                        onChange={e => setBulk(b => ({ ...b, toDate: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Day Start Time</label>
                      <input className="form-input" type="time"
                        value={bulk.slotStartTime}
                        onChange={e => setBulk(b => ({ ...b, slotStartTime: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Day End Time</label>
                      <input className="form-input" type="time"
                        value={bulk.slotEndTime}
                        onChange={e => setBulk(b => ({ ...b, slotEndTime: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Slot Duration (mins)</label>
                      <select className="form-select"
                        value={bulk.slotDurationMinutes}
                        onChange={e => setBulk(b => ({ ...b, slotDurationMinutes: +e.target.value }))}>
                        {[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Preview banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,.06), rgba(139,92,246,.04))',
                      borderRadius: 10, padding: '12px 16px',
                      fontSize: '.82rem', color: 'var(--indigo)',
                      marginBottom: 18, border: '1px solid rgba(99,102,241,.1)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <Zap size={16} />
                    <span>
                      Slots from <strong>{bulk.slotStartTime}</strong> to <strong>{bulk.slotEndTime}</strong> every <strong>{bulk.slotDurationMinutes} min</strong> from <strong>{bulk.fromDate}</strong> to <strong>{bulk.toDate}</strong>.
                    </span>
                  </motion.div>

                  <motion.button
                    className="btn btn-primary"
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar size={15} /> Generate Slots
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Date Navigation + Slot List ── */}
        <div className="card">
          <div className="card-header" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.button
                className="btn btn-sm btn-secondary"
                onClick={() => goDay('prev')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ padding: '6px 8px' }}
              >
                <ChevronLeft size={16} />
              </motion.button>
              <span className="card-title" style={{ minWidth: 200, textAlign: 'center' }}>
                {format(new Date(date + 'T00:00'), 'EEEE, dd MMM yyyy')}
              </span>
              <motion.button
                className="btn btn-sm btn-secondary"
                onClick={() => goDay('next')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ padding: '6px 8px' }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
            <input
              className="form-input"
              type="date"
              style={{ width: 'auto' }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="card-body">
            {/* Legend */}
            <div style={{
              display: 'flex', gap: 20, marginBottom: 22,
              fontSize: '.78rem', color: 'var(--gray-500)',
            }}>
              {Object.entries(statusConfig).map(([k, cfg]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: cfg.color, display: 'inline-block',
                    boxShadow: `0 0 6px ${cfg.color}40`,
                  }} />
                  {cfg.label} ({grouped[k]?.length || 0})
                </span>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}>
                <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
              </div>
            ) : slots.length === 0 ? (
              <div className="empty-state">
                <Clock size={44} />
                <h3>No slots for this date</h3>
                <p>Click "Add Slot" or "Bulk Create" to add availability.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Time</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {slots
                      .slice()
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((s, i) => {
                        const start = s.startTime.slice(0, 5);
                        const end   = s.endTime.slice(0, 5);
                        const [sh, sm] = start.split(':').map(Number);
                        const [eh, em] = end.split(':').map(Number);
                        const dur = (eh * 60 + em) - (sh * 60 + sm);
                        return (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.2 }}
                          >
                            <td>
                              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{start}</span>
                              <span style={{ color: 'var(--gray-300)', margin: '0 6px' }}>→</span>
                              <span style={{ color: 'var(--gray-600)' }}>{end}</span>
                            </td>
                            <td style={{ color: 'var(--gray-400)', fontSize: '.82rem' }}>{dur} min</td>
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '3px 10px', borderRadius: 99,
                                background: statusConfig[s.status]?.bg,
                                fontSize: '.78rem', fontWeight: 550,
                                color: statusConfig[s.status]?.color,
                              }}>
                                <SlotStatusDot status={s.status} />
                                {statusConfig[s.status]?.label}
                              </span>
                            </td>
                            <td>
                              <div className="action-row">
                                {s.status === 'AVAILABLE' && (
                                  <motion.button
                                    className="btn btn-sm btn-secondary"
                                    title="Block slot"
                                    disabled={busy === s.id}
                                    onClick={() => handleBlock(s.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {busy === s.id ? <span className="spinner spinner-dark" /> : <><Lock size={12} /> Block</>}
                                  </motion.button>
                                )}
                                {s.status !== 'BOOKED' && (
                                  <motion.button
                                    className="btn btn-sm btn-danger"
                                    title="Delete slot"
                                    disabled={busy === s.id}
                                    onClick={() => setDeleteTarget(s.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Trash2 size={12} /> Delete
                                  </motion.button>
                                )}
                                {s.status === 'BOOKED' && (
                                  <span style={{
                                    fontSize: '.75rem', color: 'var(--indigo)',
                                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                                  }}>
                                    <span style={{
                                      width: 6, height: 6, borderRadius: '50%',
                                      background: 'var(--indigo)',
                                      animation: 'pulse 2s ease-in-out infinite',
                                    }} />
                                    Booked
                                  </span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteModal
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </>
  );
}
