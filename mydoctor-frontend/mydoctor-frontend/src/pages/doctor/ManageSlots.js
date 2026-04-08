import React, { useEffect, useState } from 'react';
import { getMySlots, createSlot, createBulkSlots, deleteSlot, blockSlot } from '../../services/api';
import { Calendar, Plus, Trash2, Lock, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const today = format(new Date(), 'yyyy-MM-dd');

function SlotStatusDot({ status }) {
  const colors = { AVAILABLE: 'var(--green)', BOOKED: 'var(--teal)', BLOCKED: 'var(--gray-400)' };
  return <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background: colors[status] || 'gray', marginRight:6 }} />;
}

export default function ManageSlots() {
  const [date, setDate]           = useState(today);
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showSingle, setShowSingle] = useState(false);
  const [showBulk, setShowBulk]   = useState(false);
  const [busy, setBusy]           = useState(null);

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
      toast.success('Slot created');
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
      toast.success(`${count} slots created successfully!`);
      setShowBulk(false);
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create slots');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    setBusy(id);
    try {
      await deleteSlot(id);
      toast.success('Slot deleted');
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete booked slot');
    } finally { setBusy(null); }
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

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Manage Slots</div>
          <div className="topbar-subtitle">Create and manage your availability</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => { setShowBulk(!showBulk); setShowSingle(false); }}>
            <Calendar size={15} /> Bulk Create
          </button>
          <button className="btn btn-primary" onClick={() => { setShowSingle(!showSingle); setShowBulk(false); }}>
            <Plus size={15} /> Add Slot
          </button>
        </div>
      </div>

      <div className="page">

        {/* ── Single Slot Form ── */}
        {showSingle && (
          <div className="card" style={{ marginBottom: 20 }}>
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
                <button className="btn btn-primary" type="submit">Create Slot</button>
              </form>
            </div>
          </div>
        )}

        {/* ── Bulk Slot Form ── */}
        {showBulk && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Bulk Create Slots</span>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowBulk(false)}>
                <ChevronUp size={14} /> Close
              </button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.83rem', color: 'var(--gray-400)', marginBottom: 16 }}>
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
                <div style={{ background: 'var(--teal-pale)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '.82rem', color: 'var(--teal)', marginBottom: 16 }}>
                  💡 This will create slots from <strong>{bulk.slotStartTime}</strong> to <strong>{bulk.slotEndTime}</strong> every <strong>{bulk.slotDurationMinutes} minutes</strong> from <strong>{bulk.fromDate}</strong> to <strong>{bulk.toDate}</strong>.
                </div>
                <button className="btn btn-primary" type="submit">
                  <Calendar size={15} /> Generate Slots
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Date Picker + Slot List ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Slots for {format(new Date(date + 'T00:00'), 'EEEE, dd MMM yyyy')}</span>
            <input className="form-input" type="date" style={{ width: 'auto' }}
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="card-body">
            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: '.78rem', color: 'var(--gray-600)' }}>
              {Object.entries({ AVAILABLE: 'var(--green)', BOOKED: 'var(--teal)', BLOCKED: 'var(--gray-400)' }).map(([k, c]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  {k.charAt(0) + k.slice(1).toLowerCase()} ({grouped[k]?.length || 0})
                </span>
              ))}
            </div>

            {loading
              ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-dark" /></div>
              : slots.length === 0
                ? <div className="empty-state">
                    <Clock size={40} />
                    <h3>No slots for this date</h3>
                    <p>Click "Add Slot" or "Bulk Create" to add availability.</p>
                  </div>
                : <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slots
                          .slice()
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(s => {
                            const start = s.startTime.slice(0, 5);
                            const end   = s.endTime.slice(0, 5);
                            const [sh, sm] = start.split(':').map(Number);
                            const [eh, em] = end.split(':').map(Number);
                            const dur = (eh * 60 + em) - (sh * 60 + sm);
                            return (
                              <tr key={s.id}>
                                <td>
                                  <span style={{ fontWeight: 500 }}>{start}</span>
                                  <span style={{ color: 'var(--gray-400)', margin: '0 4px' }}>→</span>
                                  <span>{end}</span>
                                </td>
                                <td style={{ color: 'var(--gray-400)', fontSize: '.82rem' }}>{dur} min</td>
                                <td>
                                  <SlotStatusDot status={s.status} />
                                  <span style={{ fontSize: '.82rem' }}>{s.status.charAt(0) + s.status.slice(1).toLowerCase()}</span>
                                </td>
                                <td>
                                  <div className="action-row">
                                    {s.status === 'AVAILABLE' && (
                                      <button className="btn btn-sm btn-secondary" title="Block slot"
                                        disabled={busy === s.id} onClick={() => handleBlock(s.id)}>
                                        {busy === s.id ? <span className="spinner spinner-dark" /> : <><Lock size={12} /> Block</>}
                                      </button>
                                    )}
                                    {s.status !== 'BOOKED' && (
                                      <button className="btn btn-sm btn-danger" title="Delete slot"
                                        disabled={busy === s.id} onClick={() => handleDelete(s.id)}>
                                        {busy === s.id ? <span className="spinner" /> : <><Trash2 size={12} /> Delete</>}
                                      </button>
                                    )}
                                    {s.status === 'BOOKED' && (
                                      <span style={{ fontSize: '.75rem', color: 'var(--teal)', fontWeight: 500 }}>Booked</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
