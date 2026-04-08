import React, { useEffect, useState } from 'react';
import { getAllDoctors, searchDoctors, getAvailableSlots, bookAppointment } from '../../services/api';
import { Search, MapPin, Home, Clock, X, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

function DoctorCard({ doc, onBook }) {
  const initials = doc.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className="doctor-card" onClick={() => onBook(doc)}>
      <div className="doctor-card-header">
        <div className="doctor-avatar">{initials}</div>
        <div style={{flex:1}}>
          <div className="doctor-name">Dr. {doc.fullName}</div>
          <div className="doctor-spec">{doc.specialization}</div>
          <div className="doctor-exp">{doc.experienceYears} yrs experience · {doc.qualifications}</div>
        </div>
      </div>
      <div className="doctor-meta">
        {doc.clinicAddress && <span className="doctor-meta-item"><MapPin size={12}/>{doc.clinicAddress}</span>}
        {doc.acceptsHomeVisits && <span className="doctor-meta-item" style={{color:'var(--teal)'}}><Home size={12}/>Home visits</span>}
      </div>
      <div className="doctor-fee">
        <div className="fee-badge">
          <div className="fee-label">Clinic</div>
          <div className="fee-value">₹{doc.consultationFeeClinic}</div>
        </div>
        {doc.acceptsHomeVisits && <div className="fee-badge">
          <div className="fee-label">Home Visit</div>
          <div className="fee-value">₹{doc.consultationFeeHome}</div>
        </div>}
      </div>
      <button className="btn btn-outline btn-full" style={{marginTop:14}} onClick={e=>{e.stopPropagation();onBook(doc);}}>
        Book Appointment <ChevronRight size={15}/>
      </button>
    </div>
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

  useEffect(() => {
    if (type === 'CLINIC_VISIT') {
      setLoadingSlots(true);
      getAvailableSlots(doctor.doctorProfileId, date)
        .then(r => setSlots(r.data.data || []))
        .catch(()=>setSlots([]))
        .finally(()=>setLoadingSlots(false));
    }
    setSelectedSlot(null);
  }, [date, type, doctor.doctorProfileId]);

  const handleBook = async () => {
    if (type === 'CLINIC_VISIT' && !selectedSlot) return toast.error('Please select a time slot');
    if (type === 'HOME_VISIT' && !address.trim()) return toast.error('Please enter your address');
    setLoading(true);
    try {
      await bookAppointment({
        doctorId: doctor.doctorProfileId,
        timeSlotId: type === 'CLINIC_VISIT' ? selectedSlot : null,
        appointmentType: type,
        reasonForVisit: reason,
        symptoms,
        patientAddress: address || null,
      });
      toast.success('Appointment booked successfully!');
      onSuccess();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Book Appointment</h3>
            <p style={{color:'var(--gray-400)',fontSize:'.82rem',marginTop:3}}>Dr. {doctor.fullName} · {doctor.specialization}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="modal-body">
          {/* Type toggle */}
          <div className="form-group">
            <label className="form-label">Appointment Type</label>
            <div className="role-toggle">
              <button type="button" className={`role-btn ${type==='CLINIC_VISIT'?'active':''}`} onClick={()=>setType('CLINIC_VISIT')}>
                <MapPin size={14}/> Clinic Visit
              </button>
              {doctor.acceptsHomeVisits && <button type="button" className={`role-btn ${type==='HOME_VISIT'?'active':''}`} onClick={()=>setType('HOME_VISIT')}>
                <Home size={14}/> Home Visit
              </button>}
            </div>
          </div>

          {type === 'CLINIC_VISIT' && <>
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input className="form-input" type="date" value={date} min={today}
                max={format(addDays(new Date(),30),'yyyy-MM-dd')}
                onChange={e=>setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Available Slots</label>
              {loadingSlots ? <div style={{textAlign:'center',padding:20}}><div className="spinner spinner-dark"/></div>
              : slots.length === 0
                ? <p style={{fontSize:'.82rem',color:'var(--gray-400)'}}>No slots available for this date.</p>
                : <div className="slots-grid">
                    {slots.map(s => (
                      <div key={s.id} className={`slot-chip ${selectedSlot===s.id?'selected':''}`}
                        onClick={()=>setSelectedSlot(s.id)}>
                        <Clock size={12} style={{marginRight:4,verticalAlign:'middle'}}/>{s.startTime.slice(0,5)}
                      </div>
                    ))}
                  </div>
              }
            </div>
          </>}

          {type === 'HOME_VISIT' && <div className="form-group">
            <label className="form-label">Your Address *</label>
            <textarea className="form-textarea" placeholder="Enter your full address for home visit..."
              value={address} onChange={e=>setAddress(e.target.value)} style={{minHeight:80}} />
          </div>}

          <div className="form-group">
            <label className="form-label">Reason for Visit</label>
            <input className="form-input" placeholder="e.g. Regular checkup, follow-up..."
              value={reason} onChange={e=>setReason(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Symptoms (optional)</label>
            <textarea className="form-textarea" placeholder="Describe your symptoms..."
              value={symptoms} onChange={e=>setSymptoms(e.target.value)} style={{minHeight:80}} />
          </div>

          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" onClick={handleBook} disabled={loading}>
              {loading ? <span className="spinner"/> : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindDoctors() {
  const [doctors, setDoctors]   = useState([]);
  const [keyword, setKeyword]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(null);

  const load = () => {
    setLoading(true);
    const req = keyword.trim() ? searchDoctors(keyword) : getAllDoctors();
    req.then(r => setDoctors(r.data.data || [])).catch(()=>setDoctors([])).finally(()=>setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Find Doctors</div>
          <div className="topbar-subtitle">Search by name or specialization</div>
        </div>
      </div>
      <div className="page">
        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={16}/>
            <input className="form-input search-input" placeholder="Search doctors, specializations..."
              value={keyword} onChange={e=>setKeyword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&load()} />
          </div>
          <button className="btn btn-primary" onClick={load}>Search</button>
        </div>

        {loading
          ? <div style={{textAlign:'center',padding:60}}><div className="spinner spinner-dark"/></div>
          : doctors.length === 0
            ? <div className="empty-state"><Search size={40}/><h3>No doctors found</h3><p>Try a different search term.</p></div>
            : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
                {doctors.map(d => <DoctorCard key={d.doctorProfileId} doc={d} onBook={setBooking}/>)}
              </div>
        }
      </div>

      {booking && <BookingModal doctor={booking} onClose={()=>setBooking(null)} onSuccess={()=>{ setBooking(null); load(); }}/>}
    </>
  );
}
