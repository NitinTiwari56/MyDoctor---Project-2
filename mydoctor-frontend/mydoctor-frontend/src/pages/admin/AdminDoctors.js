import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  Filter,
  Edit3,
  Power,
  Eye,
  MapPin,
  Clock,
  Home,
  Building2,
  Award,
  CheckCircle,
  XCircle,
  X,
  Phone,
  Mail,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getAdminDoctors,
  updateAdminDoctor,
  toggleAdminDoctorStatus,
  verifyAdminDoctor
} from '../../services/api';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminDoctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState(searchParams.get('verification') || '');

  // Modals
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Verification modal
  const [verifyingDoctor, setVerifyingDoctor] = useState(null);
  const [verificationAction, setVerificationAction] = useState('APPROVED');
  const [verificationReason, setVerificationReason] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (specializationFilter) params.specialization = specializationFilter;

      const res = await getAdminDoctors(params);
      let list = res.data.data;

      // Filter by verification if chosen
      if (verificationFilter) {
        list = list.filter(d => (d.verificationStatus || (d.verified ? 'APPROVED' : 'PENDING')) === verificationFilter);
      }

      setDoctors(list);
    } catch (err) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specializationFilter, verificationFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleExportCsv = () => {
    if (!doctors.length) {
      toast.error('No doctors available to export');
      return;
    }

    const columns = [
      { key: 'doctorProfileId', label: 'Doctor ID' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'specialization', label: 'Specialization' },
      { key: 'qualifications', label: 'Qualifications' },
      { key: 'medicalLicenseNumber', label: 'Medical License #' },
      { key: 'verificationStatus', label: 'Verification Status' },
      { key: 'consultationFeeClinic', label: 'Clinic Fee (INR)' },
      { key: 'consultationFeeHome', label: 'Home Fee (INR)' },
      { key: 'experienceYears', label: 'Experience (Years)' },
      { key: 'acceptsHomeVisits', label: 'Accepts Home Visits' },
      { key: 'clinicAddress', label: 'Clinic Address' },
    ];

    exportToCsv(
      `mydoctor_practitioners_roster_${new Date().toISOString().slice(0, 10)}`,
      columns,
      doctors
    );
    toast.success('Doctor roster CSV downloaded');
  };

  const handleToggleStatus = async (doctor) => {
    try {
      await toggleAdminDoctorStatus(doctor.doctorProfileId);
      toast.success('Doctor account status toggled');
      fetchDoctors();
    } catch (err) {
      toast.error('Failed to toggle doctor status');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await verifyAdminDoctor(verifyingDoctor.doctorProfileId, {
        status: verificationAction,
        reason: verificationReason
      });
      toast.success(`Doctor marked as ${verificationAction}`);
      setVerifyingDoctor(null);
      setVerificationReason('');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleEditOpen = (doc) => {
    setEditingDoctor(doc);
    setEditForm({
      fullName: doc.fullName || '',
      email: doc.email || '',
      phone: doc.phone || '',
      specialization: doc.specialization || '',
      qualifications: doc.qualifications || '',
      medicalLicenseNumber: doc.medicalLicenseNumber || '',
      clinicAddress: doc.clinicAddress || '',
      consultationFeeClinic: doc.consultationFeeClinic || 0,
      consultationFeeHome: doc.consultationFeeHome || 0,
      bio: doc.bio || '',
      experienceYears: doc.experienceYears || 0,
      acceptsHomeVisits: doc.acceptsHomeVisits || false,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminDoctor(editingDoctor.doctorProfileId, editForm);
      toast.success('Doctor profile updated successfully!');
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const uniqueSpecializations = Array.from(
    new Set(doctors.map(d => d.specialization).filter(Boolean))
  );

  const getVerificationBadge = (doc) => {
    const status = doc.verificationStatus || (doc.verified ? 'APPROVED' : 'PENDING');
    switch (status) {
      case 'APPROVED':
        return (
          <span style={{
            background: 'var(--green-pale)', color: 'var(--green)',
            padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <CheckCircle size={12} /> Verified
          </span>
        );
      case 'PENDING':
        return (
          <span style={{
            background: 'var(--amber-pale)', color: 'var(--amber)',
            padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <Clock size={12} /> Needs Verification
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{
            background: 'var(--red-pale)', color: 'var(--red)',
            padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4
          }}>
            <XCircle size={12} /> License Rejected
          </span>
        );
      default:
        return null;
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
            Practitioners & Medical Specialists
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem' }}>
            Verify medical licenses, audit fee schedules, specializations, and home consultation capabilities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
          >
            <Download size={15} />
            <span>Export Roster (CSV)</span>
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 600 }}>
            Total Rostered: <strong style={{ color: 'var(--indigo)' }}>{doctors.length}</strong>
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
        marginBottom: 24,
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
              placeholder="Search by doctor name, specialization, or clinic..."
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
            <FileCheck size={15} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Verification:</span>
            <select
              className="form-input"
              style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', minWidth: 140 }}
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="">All Verification</option>
              <option value="APPROVED">Approved / Verified</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} style={{ color: 'var(--gray-400)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Specialization:</span>
            <select
              className="form-input"
              style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', minWidth: 150 }}
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="">All Specialties</option>
              {uniqueSpecializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : doctors.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 20
        }}>
          {doctors.map((doc) => {
            const initials = doc.fullName
              ? doc.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'DR';

            const status = doc.verificationStatus || (doc.verified ? 'APPROVED' : 'PENDING');

            return (
              <motion.div
                key={doc.doctorProfileId}
                whileHover={{ y: -3 }}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  border: status === 'PENDING' ? '2px solid rgba(245,158,11,0.4)' : '1px solid var(--gray-200)',
                  boxShadow: status === 'PENDING' ? '0 6px 20px rgba(245,158,11,0.08)' : '0 4px 18px rgba(0,0,0,0.03)',
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top card bar */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(20,184,166,0.25)'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>
                          {doc.fullName}
                        </h3>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--teal-dark)', marginTop: 2 }}>
                          {doc.specialization}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 1 }}>
                          {doc.qualifications || 'Certified Medical Practitioner'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {getVerificationBadge(doc)}
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                        {doc.experienceYears || 0} yrs exp
                      </span>
                    </div>
                  </div>

                  {/* License Notice if pending */}
                  {status === 'PENDING' && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: 8,
                      fontSize: '0.76rem',
                      color: 'var(--amber)',
                      fontWeight: 600,
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>License Review Required</span>
                      <button
                        onClick={() => setVerifyingDoctor(doc)}
                        style={{
                          background: 'var(--amber)', color: 'white', border: 'none',
                          borderRadius: 6, padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Verify Now
                      </button>
                    </div>
                  )}

                  {/* Details summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc.email}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                      <span>{doc.phone}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {doc.clinicAddress || 'Address not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Fees & Badges */}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'var(--gray-50)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 18,
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.74rem', display: 'block' }}>Clinic Fee</span>
                      <strong style={{ color: 'var(--navy)' }}>₹{doc.consultationFeeClinic}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.74rem', display: 'block' }}>Home Visit</span>
                      {doc.acceptsHomeVisits ? (
                        <strong style={{ color: 'var(--teal-dark)' }}>₹{doc.consultationFeeHome}</strong>
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>Not offered</span>
                      )}
                    </div>

                    <div>
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.74rem', display: 'block' }}>Modality</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--indigo)' }}>
                        <Building2 size={12} /> {doc.acceptsHomeVisits ? '+ Home' : 'Clinic'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 14, borderTop: '1px solid var(--gray-100)' }}>
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <Eye size={13} /> Profile
                  </button>

                  <button
                    onClick={() => setVerifyingDoctor(doc)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--teal-dark)' }}
                  >
                    <ShieldCheck size={13} /> Verify
                  </button>

                  <button
                    onClick={() => handleEditOpen(doc)}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)', background: 'white', borderRadius: 16, border: '1px solid var(--gray-200)' }}>
          No practitioners found matching the criteria.
        </div>
      )}

      {/* VERIFY DOCTOR LICENSE MODAL */}
      <AnimatePresence>
        {verifyingDoctor && (
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
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 460,
                padding: 28, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setVerifyingDoctor(null)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--teal-pale)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ShieldCheck size={22} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Doctor License & Credentials Verification
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 18 }}>
                Review practice eligibility for <strong>{verifyingDoctor.fullName}</strong> ({verifyingDoctor.specialization}).
              </p>

              <div style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 10, fontSize: '0.82rem', marginBottom: 16 }}>
                <div><strong>Qualifications:</strong> {verifyingDoctor.qualifications || 'MBBS'}</div>
                <div style={{ marginTop: 4 }}><strong>License #:</strong> {verifyingDoctor.medicalLicenseNumber || 'MED-REG-' + verifyingDoctor.doctorProfileId + '948'}</div>
                <div style={{ marginTop: 4 }}><strong>Current State:</strong> {verifyingDoctor.verificationStatus || (verifyingDoctor.verified ? 'APPROVED' : 'PENDING')}</div>
              </div>

              <form onSubmit={handleVerifySubmit}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Administrative Action</label>
                  <select
                    className="form-input"
                    value={verificationAction}
                    onChange={(e) => setVerificationAction(e.target.value)}
                  >
                    <option value="APPROVED">APPROVE (Verify doctor & list publicly)</option>
                    <option value="REJECTED">REJECT (Deny license application)</option>
                    <option value="PENDING">PENDING (Keep under review)</option>
                  </select>
                </div>

                {verificationAction === 'REJECTED' && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Rejection Reason</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="e.g. Incomplete credentials, invalid registration..."
                      value={verificationReason}
                      onChange={(e) => setVerificationReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button type="button" onClick={() => setVerifyingDoctor(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={verifying}
                  >
                    {verifying ? 'Updating...' : 'Save Verification State'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DOCTOR DETAILS MODAL */}
      <AnimatePresence>
        {selectedDoctor && (
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
                background: 'white', borderRadius: 20, width: '100%', maxWidth: 520,
                padding: 28, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedDoctor(null)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                  color: 'white', fontWeight: 800, fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {selectedDoctor.fullName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>{selectedDoctor.fullName}</h2>
                  <div style={{ color: 'var(--teal-dark)', fontWeight: 600, fontSize: '0.88rem' }}>{selectedDoctor.specialization}</div>
                  <div style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>Profile ID: #{selectedDoctor.doctorProfileId} • User ID: #{selectedDoctor.userId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem', color: 'var(--gray-700)', marginBottom: 24 }}>
                <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
                  <strong style={{ color: 'var(--gray-800)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: 2 }}>Qualifications</strong>
                  {selectedDoctor.qualifications || 'MBBS'} ({selectedDoctor.experienceYears} Years Clinical Practice)
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
                  <strong style={{ color: 'var(--gray-800)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: 2 }}>Clinic Address</strong>
                  {selectedDoctor.clinicAddress || 'Not specified'}
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
                  <strong style={{ color: 'var(--gray-800)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: 2 }}>Bio & Background</strong>
                  {selectedDoctor.bio || 'Experienced practitioner registered on MyDoctor healthcare network.'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--indigo)' }}>Clinic Consultation</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>₹{selectedDoctor.consultationFeeClinic}</div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(20,184,166,0.08)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--teal-dark)' }}>Home Visit Consultation</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {selectedDoctor.acceptsHomeVisits ? `₹${selectedDoctor.consultationFeeHome}` : 'Unavailable'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const doc = selectedDoctor;
                    setSelectedDoctor(null);
                    handleEditOpen(doc);
                  }}
                  className="btn btn-primary"
                >
                  Edit Information
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DOCTOR MODAL */}
      <AnimatePresence>
        {editingDoctor && (
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
                onClick={() => setEditingDoctor(null)}
                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
                Edit Doctor Profile
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: 20 }}>
                Update fees, practice details, and clinical qualifications for {editingDoctor.fullName}.
              </p>

              <form onSubmit={handleEditSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      required
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      required
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-input"
                      required
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      className="form-input"
                      required
                      value={editForm.specialization}
                      onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualifications</label>
                    <input
                      className="form-input"
                      value={editForm.qualifications}
                      onChange={e => setEditForm({ ...editForm, qualifications: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinic Fee (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.consultationFeeClinic}
                      onChange={e => setEditForm({ ...editForm, consultationFeeClinic: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Home Visit Fee (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.consultationFeeHome}
                      onChange={e => setEditForm({ ...editForm, consultationFeeHome: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      value={editForm.experienceYears}
                      onChange={e => setEditForm({ ...editForm, experienceYears: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Clinic Address</label>
                    <input
                      className="form-input"
                      value={editForm.clinicAddress}
                      onChange={e => setEditForm({ ...editForm, clinicAddress: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Doctor Bio</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editForm.acceptsHomeVisits}
                        onChange={e => setEditForm({ ...editForm, acceptsHomeVisits: e.target.checked })}
                      />
                      Doctor Accepts Home Visit Appointments
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
