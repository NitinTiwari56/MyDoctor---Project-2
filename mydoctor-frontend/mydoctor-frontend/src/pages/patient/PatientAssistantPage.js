import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Stethoscope, 
  ArrowUpRight,
  ShieldCheck,
  CalendarCheck,
  Activity,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Smile
} from 'lucide-react';
import { sendChatbotMessage, getPatientAppts } from '../../services/api';

const CLINICAL_CATEGORIES = [
  {
    name: 'Cardiology',
    icon: HeartPulse,
    color: '#ef4444',
    bg: '#fee2e2',
    symptoms: ['Chest tightness', 'Rapid pulse / palpitations', 'Shortness of breath on exertion'],
    prompt: 'I am experiencing chest pain and irregular heartbeat. Who is the best doctor for me?'
  },
  {
    name: 'Neurology',
    icon: Brain,
    color: '#8b5cf6',
    bg: '#ede9fe',
    symptoms: ['Severe migraine', 'Dizziness & vertigo', 'Visual blurriness'],
    prompt: 'I have intense headaches, dizziness, and visual blurriness. Which specialist should I see?'
  },
  {
    name: 'Dermatology',
    icon: Activity,
    color: '#06b6d4',
    bg: '#cffafe',
    symptoms: ['Itchy skin rash', 'Eczema / hives', 'Acne & skin lesions'],
    prompt: 'I have developed an itchy red skin rash and allergic flare-ups. Can you recommend the best doctor?'
  },
  {
    name: 'Orthopedics',
    icon: Bone,
    color: '#f59e0b',
    bg: '#fef3c7',
    symptoms: ['Knee joint stiffness', 'Lower back pain', 'Sprains & mobility pain'],
    prompt: 'I have severe knee joint stiffness and chronic lower back pain. Which doctor should I consult?'
  },
  {
    name: 'Pediatrics',
    icon: Baby,
    color: '#ec4899',
    bg: '#fce7f3',
    symptoms: ['Child high fever', 'Persistent cough', 'Earache & throat infection'],
    prompt: 'My child has a high fever, cough, and throat irritation. Who is the best doctor to consult?'
  },
  {
    name: 'General Medicine',
    icon: Smile,
    color: '#10b981',
    bg: '#d1fae5',
    symptoms: ['Unexplained fatigue', 'Seasonal viral fever', 'General weakness & chills'],
    prompt: 'I have high fever, body aches, and fatigue for 3 days. What doctor should I consult?'
  }
];

export default function PatientAssistantPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAppts, setPendingAppts] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! Welcome to the **Spring AI Health Assistant**.\n\nI can analyze your symptoms to find the **best specialist** on the platform, and monitor any **pending appointments** that need your attention.\n\nType your symptoms below or select a common health condition from the left panel.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestionChips: [
        '⏰ Check my pending appointments',
        '🩺 Recommend doctor for chest tightness',
        '🌿 Doctor for allergic skin rash',
        '🧠 Doctor for migraine and dizziness'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load appointments for quick sidebar indicator
  useEffect(() => {
    getPatientAppts()
      .then(res => {
        const appts = res.data?.data || [];
        const pending = appts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
        setPendingAppts(pending);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: text,
        history: historyPayload
      });

      const data = response.data?.data || {};

      const assistantMsg = {
        role: 'assistant',
        content: data.reply || "I analyzed your symptoms. Here are the clinical insights and recommendations.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedSpecialty: data.recommendedSpecialty,
        identifiedSymptoms: Array.isArray(data.identifiedSymptoms)
          ? data.identifiedSymptoms
          : (data.symptomsIdentified ? [data.symptomsIdentified] : []),
        recommendedDoctors: data.recommendedDoctors || [],
        pendingAppointments: data.pendingAppointments || [],
        suggestionChips: data.suggestionChips || data.quickSuggestions || [],
        emergencyAlert: data.emergencyAlert || data.isEmergency || false
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const isNetwork = !err.response || err.code === 'ERR_NETWORK';
      const errText = isNetwork
        ? "⚠️ Unable to connect to backend at http://localhost:8080. Please ensure the Spring Boot server is running."
        : (err.response?.data?.message || "Sorry, I encountered an issue connecting to Spring AI. Please try again.");
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestionChips: ['⏰ Check pending appointments', 'Try again']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Conversation refreshed. Please tell me your symptoms or ask about your appointments.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestionChips: [
          '⏰ Check my pending appointments',
          '🩺 Recommend doctor for chest tightness',
          '🌿 Doctor for allergic skin rash'
        ]
      }
    ]);
  };

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Bot size={18} />
            </div>
            AI Health Assistant & Doctor Matchmaker
          </div>
          <div className="topbar-subtitle">
            Powered by Spring AI Clinical Triage · Real-time symptom reasoning & appointment reminders
          </div>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleResetChat}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RotateCcw size={14} /> Clear History
        </button>
      </div>

      <div className="page" style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: 24,
          alignItems: 'start'
        }}>
          {/* Left Column: Quick Triage & Pending Appointment Watch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Pending Appointments Alert Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #0b0f1a 0%, #1e1b4b 100%)',
                color: '#fff',
                borderRadius: 18,
                padding: '20px',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 90, height: 90,
                borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarCheck size={16} /> Appointment Reminder
                </span>
                <span style={{
                  background: pendingAppts.length > 0 ? '#10b981' : '#64748b',
                  color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 9999
                }}>
                  {pendingAppts.length} active
                </span>
              </div>

              {pendingAppts.length > 0 ? (
                <div>
                  <div style={{ fontSize: '0.86rem', color: '#e2e8f0', marginBottom: 10 }}>
                    You have <strong>{pendingAppts.length} pending or confirmed</strong> consultation(s). Ask the AI or click below to check slots.
                  </div>
                  <button
                    className="btn btn-primary btn-sm btn-full"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '0.78rem' }}
                    onClick={() => handleSend('Show my pending and scheduled appointments with details')}
                  >
                    Ask AI for Reminders & Status <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  No pending appointments right now. Describe any symptoms to find and book with top doctors!
                </div>
              )}
            </motion.div>

            {/* Quick Symptom Categories */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Stethoscope size={18} style={{ color: 'var(--indigo)' }} />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0 }}>
                  Quick Symptom Triage
                </h3>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--gray-500)', marginBottom: 14 }}>
                Select a health concern to instantly assess symptoms and match with verified doctors:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CLINICAL_CATEGORIES.map((cat, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(cat.prompt)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--gray-200)',
                      background: 'var(--white)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: cat.bg, color: cat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <cat.icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.symptoms.join(' · ')}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--gray-400)' }} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* How Spring AI Works Card */}
            <div className="card" style={{ padding: 18, background: '#f8fafc' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={14} style={{ color: '#6366f1' }} />
                Spring AI Architecture
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
                Our backend uses Spring AI with OpenAI ChatClient orchestration, backed by a deterministic clinical rule engine and real-time database queries to match you with verified doctors and alert you about pending appointments.
              </p>
            </div>
          </div>

          {/* Right Column: Full Interactive Chat Feed */}
          <div className="card" style={{
            height: 740,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: 20
          }}>
            {/* Chat Feed Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0b0f1a 0%, #1e1b4b 100%)',
              color: '#fff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}>
                  <Bot size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    MyDoctor AI Assistant
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>
                    Online · Ready for symptom triage & appointment inquiries
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-sm"
                  onClick={handleResetChat}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.75rem'
                  }}
                >
                  <RotateCcw size={13} style={{ marginRight: 4 }} /> Restart
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              background: '#f8fafc'
            }}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: isUser ? '80%' : '88%',
                      flexDirection: isUser ? 'row-reverse' : 'row'
                    }}
                  >
                    {!isUser ? (
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #312e81, #4f46e5)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                      }}>
                        <Bot size={18} />
                      </div>
                    ) : (
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.76rem', fontWeight: 700, flexShrink: 0
                      }}>
                        You
                      </div>
                    )}

                    <div style={{
                      padding: '14px 18px',
                      borderRadius: 18,
                      background: isUser ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#ffffff',
                      color: isUser ? '#ffffff' : '#1e293b',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      borderBottomRightRadius: isUser ? 4 : 18,
                      borderBottomLeftRadius: isUser ? 18 : 4,
                      boxShadow: isUser ? '0 4px 14px rgba(99, 102, 241, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                      fontSize: '0.9rem',
                      lineHeight: 1.55,
                      wordBreak: 'break-word'
                    }}>
                      {/* Emergency alert */}
                      {msg.emergencyAlert && (
                        <div style={{
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderLeft: '4px solid #f43f5e',
                          borderRadius: 10,
                          padding: '10px 14px',
                          color: '#9f1239',
                          marginBottom: 10,
                          fontSize: '0.82rem'
                        }}>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: '#e11d48', marginBottom: 2 }}>
                            <AlertTriangle size={15} /> Urgent Medical Warning
                          </div>
                          Please visit the nearest Emergency Room (ER) or call local emergency services immediately!
                        </div>
                      )}

                      <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>

                      {/* Identified symptoms */}
                      {msg.identifiedSymptoms && msg.identifiedSymptoms.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                            Identified Symptoms:
                          </span>
                          {msg.identifiedSymptoms.map((sym, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 9999
                              }}
                            >
                              • {sym}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recommended Specialty */}
                      {msg.recommendedSpecialty && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#4338ca',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: 8
                          }}>
                            <Stethoscope size={14} /> Recommended Specialist: {msg.recommendedSpecialty}
                          </div>
                        </div>
                      )}

                      {/* Pending Appointments Cards */}
                      {msg.pendingAppointments && msg.pendingAppointments.length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CalendarCheck size={15} style={{ color: '#4f46e5' }} />
                            Your Scheduled & Pending Appointments ({msg.pendingAppointments.length})
                          </div>
                          {msg.pendingAppointments.map((appt, aIdx) => (
                            <div
                              key={aIdx}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderLeft: `4px solid ${appt.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'}`,
                                borderRadius: 10,
                                padding: '10px 14px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                                  Dr. {appt.doctorName || 'Doctor'}
                                </span>
                                <span style={{
                                  background: appt.status === 'CONFIRMED' ? '#d1fae5' : '#fef3c7',
                                  color: appt.status === 'CONFIRMED' ? '#065f46' : '#92400e',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 9999
                                }}>
                                  {appt.status}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 14, fontSize: '0.74rem', color: '#475569', marginTop: 4 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={12} /> {appt.appointmentDate}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> {appt.timeSlot}
                                </span>
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate('/patient/appointments')}
                            style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            Manage in Appointments Portal <ArrowUpRight size={13} />
                          </button>
                        </div>
                      )}

                      {/* Doctor Recommendations */}
                      {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                            Top Recommended Doctors for You ({msg.recommendedDoctors.length})
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                            {msg.recommendedDoctors.map((doc, dIdx) => (
                              <div
                                key={dIdx}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e0e7ff',
                                  borderRadius: 14,
                                  padding: 12,
                                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
                                }}
                              >
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <img
                                    src={doc.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=6366f1&color=fff`}
                                    alt={doc.fullName}
                                    style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=6366f1&color=fff`;
                                    }}
                                  />
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      Dr. {doc.fullName}
                                      {doc.verified && <ShieldCheck size={13} style={{ color: '#10b981' }} />}
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#4f46e5', fontWeight: 600 }}>
                                      {doc.specialization}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                      {doc.experienceYears ? `${doc.experienceYears} yrs exp` : ''} {doc.qualification ? ` · ${doc.qualification}` : ''}
                                    </div>
                                  </div>
                                </div>

                                {doc.clinicAddress && (
                                  <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                    <MapPin size={11} /> {doc.clinicAddress}
                                  </div>
                                )}

                                <div style={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0'
                                }}>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                                    ₹{doc.consultationFee || doc.consultationFeeClinic || '400'} <span style={{ fontSize: '0.68rem', fontWeight: 400, color: '#64748b' }}>/ visit</span>
                                  </div>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/patient/doctors?search=${encodeURIComponent(doc.fullName || doc.specialization)}`)}
                                    style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
                                  >
                                    Book Now <ChevronRight size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clickable Suggestion Chips */}
                      {msg.suggestionChips && msg.suggestionChips.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {msg.suggestionChips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              className="chat-chip"
                              onClick={() => handleSend(chip)}
                              disabled={loading}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                padding: '4px 10px',
                                borderRadius: 9999,
                                fontSize: '0.74rem',
                                cursor: 'pointer'
                              }}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.66rem', color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8', textAlign: 'right', marginTop: 4 }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg, #312e81, #4f46e5)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Bot size={18} />
                  </div>
                  <div style={{
                    padding: '10px 16px', borderRadius: 14,
                    background: '#ffffff', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <div className="spinner spinner-dark" style={{ width: 14, height: 14 }} />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Spring AI is assessing symptoms & retrieving doctors...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '6px 8px 6px 16px'
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Describe what you are feeling (e.g. chest pain, skin rash, knee stiffness) or ask about pending appointments..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.9rem',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!input.trim() || loading}
                  style={{
                    borderRadius: 12,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)'
                  }}
                >
                  <Send size={15} /> Send
                </button>
              </form>
              <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8', marginTop: 8 }}>
                Clinical guidance is powered by Spring AI & verified doctor rosters. Always consult a healthcare provider for emergency situations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
