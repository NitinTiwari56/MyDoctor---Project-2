import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Home,
  Building2,
  Eye,
  Trash2,
  Check,
  X,
  CreditCard,
  User,
  Stethoscope,
  MapPin,
  FileText,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getAdminAppointments,
  updateAdminApptStatus,
  deleteAdminAppt
} from '../../services/api';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminAppointments() {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [statusModalAppt, setStatusModalAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [deletingAppt, setDeletingAppt] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await getAdminAppointments(params);
      setAppointments(res.data.data);

      const targetId = searchParams.get('selected');
      if (targetId) {
        const found = res.data.data.find(a => a.id === parseInt(targetId));
        if (found) setSelectedAppt(found);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleOpenStatusModal = (appt) => {
    setStatusModalAppt(appt);
    setNewStatus(appt.status);
    setDoctorNotes(appt.doctorNotes || '');
    setRejectionReason(appt.rejectionReason || '');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateAdminApptStatus(statusModalAppt.id, {
        status: newStatus,
        doctorNotes,
        rejectionReason
      });
      toast.success(`Appointment #${statusModalAppt.id} marked as ${newStatus}`);
      setStatusModalAppt(null);
      if (selectedAppt?.id === statusModalAppt.id) {
        setSelectedAppt(res.data.data);
      }
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppt) return;
    try {
      await deleteAdminAppt(deletingAppt.id);
      toast.success(`Appointment #${deletingAppt.id} deleted.`);
      setDeletingAppt(null);
      if (selectedAppt?.id === deletingAppt.id) setSelectedAppt(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const handleExportCsv = () => {
    if (!appointments.length) {
      toast.error('No appointments to export');
      return;
    }

    const columns = [
      { key: 'id', label: 'Appointment ID' },
      { key: 'patientName', label: 'Patient Name' },
      { key: 'patientPhone', label: 'Patient Phone' },
      { key: 'doctorName', label: 'Doctor Name' },
      { key: 'doctorSpecialization', label: 'Doctor Specialization' },
      { key: 'appointmentDate', label: 'Date' },
      { key: 'startTime', label: 'Start Time' },
      { key: 'endTime', label: 'End Time' },
      { key: 'appointmentType', label: 'Modality' },
      { key: 'status', label: 'Status' },
      { key: 'paymentStatus', label: 'Payment' },
      { key: 'reasonForVisit', label: 'Reason' },
      { key: 'symptoms', label: 'Symptoms' },
      { key: 'patientAddress', label: 'Home Address' },
      { key: 'doctorNotes', label: 'Doctor Notes' },
    ];

    exportToCsv(
      `mydoctor_appointments_audit_${new Date().toISOString().slice(0, 10)}`,
      columns,
      appointments
    );
    toast.success('Appointments audit CSV downloaded');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Confirmed</span>;
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
      case 'COMPLETED':
        return <span className="badge badge-primary"><CheckCircle2 size={12} /> Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      case 'REJECTED':
        return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            Appointments Platform Control
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem' }}>
            Comprehensive management of clinic visits, home doctor dispatches, and schedule states.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 600 }}>
            Total Bookings: <strong style={{ color: 'var(--indigo)' }}>{appointments.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 20px',
        border: '1px solid var(--gray-200)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 38, height: 40 }}
              placeholder="Search by patient, doctor, reason, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ height: 40 }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Status:</span>
            <select
              className="form-input"
              style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', minWidth: 140 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Type:</span>
            <select
              className="form-input"
              style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', minWidth: 130 }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Modalities</option>
              <option value="CLINIC">Clinic Visit</option>
              <option value="HOME_VISIT">Home Visit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid var(--gray-200)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : appointments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-500)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Appt #</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Doctor</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Schedule</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--navy)' }}>
                      #{appt.id}
                    </td>

                    {/* Patient */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{appt.patientName || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>{appt.patientPhone || 'No phone'}</div>
                    </td>

                    {/* Doctor */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{appt.doctorName || 'Doctor'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--indigo)' }}>{appt.doctorSpecialization}</div>
                    </td>

                    {/* Schedule */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{appt.appointmentDate || 'Not set'}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)' }}>
                        {appt.startTime ? `${appt.startTime} - ${appt.endTime}` : 'No slot'}
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '14px 16px' }}>
                      {appt.appointmentType === 'HOME_VISIT' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: 'var(--teal-dark)', fontWeight: 600 }}>
                          <Home size={12} /> Home Visit
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', color: 'var(--indigo)', fontWeight: 600 }}>
                          <Building2 size={12} /> Clinic
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(appt.status)}
                    </td>

                    {/* Payment */}
                    <td style={{ padding: '14px 16px' }}>
                      {appt.paymentStatus === 'PAID' ? (
                        <span style={{ fontSize: '0.74rem', color: 'var(--green)', fontWeight: 700, background: 'var(--green-pale)', padding: '2px 6px', borderRadius: 6 }}>
                          PAID
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 6 }}>
                          {appt.paymentStatus || 'UNPAID'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => setSelectedAppt(appt)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          onClick={() => handleOpenStatusModal(appt)}
                          className="btn btn-primary"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                          title="Update Status"
                        >
                          Status
                        </button>

                        <button
                          onClick={() => setDeletingAppt(appt)}
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: '0.76rem', background: 'var(--red-pale)', color: 'var(--red)', border: 'none' }}
                          title="Delete appointment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--gray-400)' }}>
            No appointments match the selected filters.
          </div>
        )}
      </div>

      {/* VIEW FULL DETAILS DRAWER / MODAL */}
      <AnimatePresence>
        {selectedAppt && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 580,
                maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedAppt(null)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--indigo)', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 8 }}>
                  Appointment #{selectedAppt.id}
                </span>
                {getStatusBadge(selectedAppt.status)}
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 18 }}>
                Appointment Full Record
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
                {/* Patient card */}
                <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--navy)', fontWeight: 700, marginBottom: 4 }}>
                    <User size={15} style={{ color: 'var(--indigo)' }} /> Patient Information
                  </div>
                  <div style={{ color: 'var(--gray-800)', fontWeight: 600 }}>{selectedAppt.patientName}</div>
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>Contact: {selectedAppt.patientPhone || 'N/A'}</div>
                  {selectedAppt.patientAddress && (
                    <div style={{ color: 'var(--gray-600)', fontSize: '0.8rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> Address: {selectedAppt.patientAddress}
                    </div>
                  )}
                </div>

                {/* Doctor card */}
                <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--navy)', fontWeight: 700, marginBottom: 4 }}>
                    <Stethoscope size={15} style={{ color: 'var(--teal-dark)' }} /> Healthcare Specialist
                  </div>
                  <div style={{ color: 'var(--gray-800)', fontWeight: 600 }}>{selectedAppt.doctorName}</div>
                  <div style={{ color: 'var(--teal-dark)', fontSize: '0.8rem' }}>{selectedAppt.doctorSpecialization}</div>
                </div>

                {/* Timing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)' }}>Date & Slot</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{selectedAppt.appointmentDate || 'Not set'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{selectedAppt.startTime} - {selectedAppt.endTime}</div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-500)' }}>Consultation Mode</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{selectedAppt.appointmentType}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--indigo)' }}>Payment: {selectedAppt.paymentStatus || 'UNPAID'}</div>
                  </div>
                </div>

                {/* Clinical details */}
                <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>Reason for Visit:</div>
                  <div style={{ color: 'var(--gray-600)', marginBottom: 8 }}>{selectedAppt.reasonForVisit || 'None noted'}</div>

                  <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>Symptoms:</div>
                  <div style={{ color: 'var(--gray-600)' }}>{selectedAppt.symptoms || 'None noted'}</div>
                </div>

                {selectedAppt.doctorNotes && (
                  <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--indigo)', marginBottom: 4 }}>Doctor Clinical Notes:</div>
                    <div style={{ color: 'var(--gray-800)' }}>{selectedAppt.doctorNotes}</div>
                  </div>
                )}

                {selectedAppt.rejectionReason && (
                  <div style={{ padding: '12px 16px', background: 'rgba(244,63,94,0.06)', borderRadius: 12, border: '1px solid rgba(244,63,94,0.15)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>Cancellation / Rejection Reason:</div>
                    <div style={{ color: 'var(--gray-800)' }}>{selectedAppt.rejectionReason}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={() => setSelectedAppt(null)} className="btn btn-secondary">
                  Close
                </button>
                <button
                  onClick={() => {
                    const a = selectedAppt;
                    setSelectedAppt(null);
                    handleOpenStatusModal(a);
                  }}
                  className="btn btn-primary"
                >
                  Change Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE STATUS MODAL */}
      <AnimatePresence>
        {statusModalAppt && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 480,
                padding: 28, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setStatusModalAppt(null)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Override Appointment Status
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 20 }}>
                Updating booking #{statusModalAppt.id} ({statusModalAppt.patientName} with {statusModalAppt.doctorName})
              </p>

              <form onSubmit={handleStatusSubmit}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">New Status</label>
                  <select
                    className="form-input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="CONFIRMED">CONFIRMED (Approve slot)</option>
                    <option value="COMPLETED">COMPLETED (Finished visit)</option>
                    <option value="CANCELLED">CANCELLED (Free up slot)</option>
                    <option value="REJECTED">REJECTED (Decline booking)</option>
                    <option value="PENDING">PENDING (Awaiting response)</option>
                  </select>
                </div>

                {newStatus === 'COMPLETED' && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Doctor / Clinical Notes</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Add summary notes or prescribed guidance..."
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                    />
                  </div>
                )}

                {(newStatus === 'CANCELLED' || newStatus === 'REJECTED') && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Reason for Cancellation / Rejection</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Specify reason to inform patient & doctor..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                  <button
                    type="button"
                    onClick={() => setStatusModalAppt(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Apply Status Override'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE APPOINTMENT CONFIRMATION */}
      <AnimatePresence>
        {deletingAppt && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 400,
                padding: 26, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: 'var(--red-pale)',
                color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Trash2 size={24} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
                Delete Appointment #{deletingAppt.id}?
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 22 }}>
                This record will be permanently deleted from the database and the associated slot will be restored to Available.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => setDeletingAppt(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn"
                  style={{ flex: 1, background: 'var(--red)', color: 'white' }}
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
