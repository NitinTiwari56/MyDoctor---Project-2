import React, { useEffect, useState } from 'react';
import { getPatientAppts, cancelAppointment } from '../../services/api';
import { CalendarCheck, Clock, Home, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default function MyAppointments() {
  const [appts, setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    setLoading(true);
    getPatientAppts().then(r => setAppts(r.data.data || [])).catch(()=>setAppts([])).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      load();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally { setCancelling(null); }
  };

  const tabs = ['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED','REJECTED'];
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
        <div className="tabs">
          {tabs.map(t => <button key={t} className={`tab-btn ${filter===t?'active':''}`} onClick={()=>setFilter(t)}>{t}</button>)}
        </div>

        {loading
          ? <div style={{textAlign:'center',padding:60}}><div className="spinner spinner-dark"/></div>
          : filtered.length === 0
            ? <div className="empty-state"><CalendarCheck size={40}/><h3>No appointments</h3><p>No {filter.toLowerCase()} appointments found.</p></div>
            : <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {filtered.map(a => (
                  <div className="card" key={a.id}>
                    <div className="card-body" style={{padding:'18px 22px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                        <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                          <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--teal),#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:'var(--font-display)',fontSize:'1rem',flexShrink:0}}>
                            {a.doctorName?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--navy)'}}>Dr. {a.doctorName}</div>
                            <div style={{fontSize:'.78rem',color:'var(--teal)',fontWeight:500,textTransform:'uppercase',letterSpacing:'.05em'}}>{a.doctorSpecialization}</div>
                            <div style={{display:'flex',gap:12,marginTop:8,fontSize:'.8rem',color:'var(--gray-600)',flexWrap:'wrap'}}>
                              {a.appointmentDate && <span style={{display:'flex',alignItems:'center',gap:4}}><CalendarCheck size={12}/>
                                {format(new Date(a.appointmentDate),'dd MMM yyyy')}</span>}
                              {a.startTime && <span style={{display:'flex',alignItems:'center',gap:4}}><Clock size={12}/>{a.startTime.slice(0,5)}</span>}
                              <span style={{display:'flex',alignItems:'center',gap:4}}>
                                {a.appointmentType==='HOME_VISIT' ? <><Home size={12}/>Home Visit</> : <><MapPin size={12}/>Clinic Visit</>}
                              </span>
                            </div>
                            {a.reasonForVisit && <div style={{marginTop:8,fontSize:'.8rem',color:'var(--gray-400)'}}>Reason: {a.reasonForVisit}</div>}
                            {a.doctorNotes && <div style={{marginTop:6,fontSize:'.8rem',background:'var(--teal-pale)',color:'var(--teal)',padding:'6px 10px',borderRadius:6}}>📋 {a.doctorNotes}</div>}
                            {a.rejectionReason && <div style={{marginTop:6,fontSize:'.8rem',background:'var(--red-pale)',color:'var(--red)',padding:'6px 10px',borderRadius:6}}>❌ {a.rejectionReason}</div>}
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:10}}>
                          <StatusBadge status={a.status}/>
                          {['PENDING','CONFIRMED'].includes(a.status) &&
                            <button className="btn btn-danger btn-sm" disabled={cancelling===a.id} onClick={()=>handleCancel(a.id)}>
                              {cancelling===a.id ? <span className="spinner"/> : 'Cancel'}
                            </button>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        }
      </div>
    </>
  );
}
