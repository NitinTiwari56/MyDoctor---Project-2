import React, { useEffect, useState } from 'react';
import { getDoctorAppts, confirmAppt, rejectAppt, completeAppt } from '../../services/api';
import { CalendarClock, Clock, Home, MapPin, CheckCircle, XCircle, Award } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

function NotesModal({ title, placeholder, onConfirm, onClose }) {
  const [text, setText] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>{title}</h3></div>
        <div className="modal-body">
          <textarea className="form-textarea" placeholder={placeholder} value={text} onChange={e=>setText(e.target.value)} style={{minHeight:100}}/>
          <div style={{display:'flex',gap:10,marginTop:12}}>
            <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" onClick={()=>onConfirm(text)}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [modal, setModal]     = useState(null); // { type, apptId }
  const [busy, setBusy]       = useState(null);

  const load = () => {
    setLoading(true);
    getDoctorAppts().then(r=>setAppts(r.data.data||[])).catch(()=>setAppts([])).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleConfirm = async (id) => {
    setBusy(id);
    try { await confirmAppt(id); toast.success('Appointment confirmed'); load(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(null); }
  };

  const handleReject = async (reason) => {
    setBusy(modal.apptId);
    try { await rejectAppt(modal.apptId, { rejectionReason: reason }); toast.success('Appointment rejected'); setModal(null); load(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(null); }
  };

  const handleComplete = async (notes) => {
    setBusy(modal.apptId);
    try { await completeAppt(modal.apptId, { doctorNotes: notes }); toast.success('Marked as completed'); setModal(null); load(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setBusy(null); }
  };

  const tabs = ['ALL','PENDING','CONFIRMED','COMPLETED','REJECTED','CANCELLED'];
  const filtered = filter==='ALL' ? appts : appts.filter(a=>a.status===filter);

  return (
    <>
      <div className="topbar">
        <div><div className="topbar-title">Appointments</div><div className="topbar-subtitle">{appts.length} total</div></div>
      </div>
      <div className="page">
        <div className="tabs">
          {tabs.map(t=><button key={t} className={`tab-btn ${filter===t?'active':''}`} onClick={()=>setFilter(t)}>{t}</button>)}
        </div>

        {loading
          ? <div style={{textAlign:'center',padding:60}}><div className="spinner spinner-dark"/></div>
          : filtered.length===0
            ? <div className="empty-state"><CalendarClock size={40}/><h3>No appointments</h3></div>
            : <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {filtered.map(a=>(
                  <div className="card" key={a.id}>
                    <div className="card-body" style={{padding:'18px 22px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                        <div>
                          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--navy)'}}>{a.patientName}</div>
                          <div style={{fontSize:'.78rem',color:'var(--gray-400)',marginTop:2}}>{a.patientPhone}</div>
                          <div style={{display:'flex',gap:12,marginTop:8,fontSize:'.8rem',color:'var(--gray-600)',flexWrap:'wrap'}}>
                            {a.appointmentDate && <span style={{display:'flex',alignItems:'center',gap:4}}><CalendarClock size={12}/>{format(new Date(a.appointmentDate),'dd MMM yyyy')}</span>}
                            {a.startTime && <span style={{display:'flex',alignItems:'center',gap:4}}><Clock size={12}/>{a.startTime.slice(0,5)}</span>}
                            <span style={{display:'flex',alignItems:'center',gap:4}}>
                              {a.appointmentType==='HOME_VISIT'?<><Home size={12}/>Home — {a.patientAddress}</>:<><MapPin size={12}/>Clinic Visit</>}
                            </span>
                          </div>
                          {a.reasonForVisit && <div style={{marginTop:8,fontSize:'.8rem',color:'var(--gray-500)'}}>Reason: {a.reasonForVisit}</div>}
                          {a.symptoms && <div style={{fontSize:'.8rem',color:'var(--gray-500)'}}>Symptoms: {a.symptoms}</div>}
                          {a.rejectionReason && <div style={{marginTop:6,fontSize:'.8rem',background:'var(--red-pale)',color:'var(--red)',padding:'6px 10px',borderRadius:6}}>Rejected: {a.rejectionReason}</div>}
                          {a.doctorNotes && <div style={{marginTop:6,fontSize:'.8rem',background:'var(--teal-pale)',color:'var(--teal)',padding:'6px 10px',borderRadius:6}}>Notes: {a.doctorNotes}</div>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:10}}>
                          <StatusBadge status={a.status}/>
                          <div className="action-row">
                            {a.status==='PENDING' && <>
                              <button className="btn btn-sm btn-primary" disabled={busy===a.id} onClick={()=>handleConfirm(a.id)}>
                                {busy===a.id?<span className="spinner"/>:<><CheckCircle size={13}/>Confirm</>}
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={()=>setModal({type:'reject',apptId:a.id})}>
                                <XCircle size={13}/>Reject
                              </button>
                            </>}
                            {a.status==='CONFIRMED' &&
                              <button className="btn btn-sm btn-outline" onClick={()=>setModal({type:'complete',apptId:a.id})}>
                                <Award size={13}/>Complete
                              </button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        }
      </div>

      {modal?.type==='reject' && <NotesModal title="Reject Appointment" placeholder="Reason for rejection (optional)..." onConfirm={handleReject} onClose={()=>setModal(null)}/>}
      {modal?.type==='complete' && <NotesModal title="Complete Appointment" placeholder="Add doctor's notes / prescription..." onConfirm={handleComplete} onClose={()=>setModal(null)}/>}
    </>
  );
}
