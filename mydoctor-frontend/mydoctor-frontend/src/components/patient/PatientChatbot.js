import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Minus, 
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
  CalendarCheck
} from 'lucide-react';
import { sendChatbotMessage } from '../../services/api';
import './PatientChatbot.css';

const INITIAL_SUGGESTIONS = [
  '⏰ Check my pending appointments',
  '🩺 Chest pain and rapid heartbeat',
  '🧠 Severe headache, dizziness and blurriness',
  '🌿 Skin allergy, itching and red rashes',
  '🦴 Knee joint pain and morning stiffness',
  '👶 Child fever, sore throat and coughing'
];

export default function PatientChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **MyDoctor AI Health Assistant** powered by Spring AI. 👋\n\nI can help analyze your symptoms to find the **best specialist** for your care, and keep you updated on any **pending appointments**.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestionChips: INITIAL_SUGGESTIONS
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Format history for Spring AI backend
    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: query,
        history: historyPayload
      });

      const data = response.data?.data || {};

      const assistantMessage = {
        role: 'assistant',
        content: data.reply || "I analyzed your request. Please review the recommendations below.",
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

      setMessages(prev => [...prev, assistantMessage]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const isNetwork = !err.response || err.code === 'ERR_NETWORK';
      const errText = isNetwork
        ? "⚠️ Unable to connect to backend at http://localhost:8080. Please ensure your Spring Boot backend application is running."
        : (err.response?.data?.message || "I'm having trouble connecting to the clinical triage service right now. Please try again in a moment.");
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
        content: "Chat history cleared. How can I assist you with your health or appointment queries today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestionChips: INITIAL_SUGGESTIONS
      }
    ]);
  };

  const handleNavigateDoctor = (doctor) => {
    setIsOpen(false);
    navigate(`/patient/doctors?search=${encodeURIComponent(doctor.fullName || doctor.specialization)}`);
  };

  const handleNavigateAppointments = () => {
    setIsOpen(false);
    navigate('/patient/appointments');
  };

  return (
    <div className="chatbot-floating-wrapper">
      <AnimatePresence>
        {/* Floating Hint bubble when closed */}
        {!isOpen && showHint && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="chatbot-hint-bubble"
          >
            <Sparkles size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span>Need doctor suggestions or appointment updates? Ask AI!</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* Chatbot Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="chatbot-drawer"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-glow" />
              <div className="chatbot-header-info">
                <div className="chatbot-bot-avatar">
                  <Bot size={22} />
                  <span className="chatbot-online-dot" />
                </div>
                <div>
                  <div className="chatbot-title">
                    MyDoctor AI Assistant
                  </div>
                  <div className="chatbot-subtitle">
                    <Sparkles size={11} /> Spring AI Clinical Triage
                  </div>
                </div>
              </div>

              <div className="chatbot-header-actions">
                <button
                  className="chatbot-header-btn"
                  title="Reset conversation"
                  onClick={handleResetChat}
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  className="chatbot-header-btn"
                  title="Minimize"
                  onClick={() => setIsOpen(false)}
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Sub-header status notification */}
            <div className="chatbot-notice-banner">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={13} />
                Symptom matching & appointment reminders
              </span>
              <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>Spring AI 0.8.1</span>
            </div>

            {/* Messages stream */}
            <div className="chatbot-messages">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`chat-row ${isUser ? 'chat-row-user' : 'chat-row-assistant'}`}
                  >
                    {!isUser ? (
                      <div className="chat-avatar-bot">
                        <Bot size={17} />
                      </div>
                    ) : (
                      <div className="chat-avatar-user">
                        You
                      </div>
                    )}

                    <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                      {/* Emergency Alert Card */}
                      {msg.emergencyAlert && (
                        <div className="chat-emergency-card">
                          <div className="chat-emergency-title">
                            <AlertTriangle size={15} />
                            Urgent Medical Warning
                          </div>
                          <div>
                            Your symptoms may indicate an emergency. Please visit the nearest Emergency Room (ER) or call local emergency services immediately!
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {msg.content}
                      </div>

                      {/* Identified Symptoms Pill Tags */}
                      {msg.identifiedSymptoms && msg.identifiedSymptoms.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginRight: 6 }}>
                            Identified Symptoms:
                          </span>
                          {msg.identifiedSymptoms.map((sym, sIdx) => (
                            <span key={sIdx} className="chat-symptom-tag">
                              • {sym}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recommended Specialty Badge */}
                      {msg.recommendedSpecialty && (
                        <div style={{ marginTop: 4 }}>
                          <div className="chat-specialty-badge">
                            <Stethoscope size={13} />
                            Recommended Specialist: {msg.recommendedSpecialty}
                          </div>
                        </div>
                      )}

                      {/* Pending Appointments Cards */}
                      {msg.pendingAppointments && msg.pendingAppointments.length > 0 && (
                        <div className="chat-appts-container">
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <CalendarCheck size={14} style={{ color: '#4f46e5' }} />
                            Your Scheduled & Pending Appointments ({msg.pendingAppointments.length})
                          </div>
                          {msg.pendingAppointments.map((appt, aIdx) => (
                            <div
                              key={aIdx}
                              className={`chat-appt-card ${appt.status === 'CONFIRMED' ? 'chat-appt-confirmed' : ''}`}
                            >
                              <div className="chat-appt-header">
                                <span className="chat-appt-doc">
                                  Dr. {appt.doctorName || 'Doctor'}
                                </span>
                                <span className={appt.status === 'CONFIRMED' ? 'chat-appt-status-confirmed' : 'chat-appt-status-pending'}>
                                  {appt.status}
                                </span>
                              </div>
                              <div className="chat-appt-meta">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={12} /> {appt.appointmentDate}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> {appt.timeSlot}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                                <span>{appt.specialization || 'General Consultation'}</span>
                                {appt.consultationFee && <span>Fee: ₹{appt.consultationFee}</span>}
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.74rem', padding: '5px 10px', marginTop: 4, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            onClick={handleNavigateAppointments}
                          >
                            Manage Appointments in Portal <ArrowUpRight size={13} />
                          </button>
                        </div>
                      )}

                      {/* Recommended Doctors Cards */}
                      {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                        <div className="chat-recommendations">
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                            Top Recommended Doctors for You ({msg.recommendedDoctors.length})
                          </div>
                          {msg.recommendedDoctors.map((doc, dIdx) => (
                            <div key={dIdx} className="chat-doc-card">
                              <div className="chat-doc-header">
                                <img
                                  src={doc.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=6366f1&color=fff`}
                                  alt={doc.fullName}
                                  className="chat-doc-avatar"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=6366f1&color=fff`;
                                  }}
                                />
                                <div className="chat-doc-info">
                                  <div className="chat-doc-name">
                                    Dr. {doc.fullName}
                                    {doc.verified && (
                                      <ShieldCheck size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                                    )}
                                  </div>
                                  <div className="chat-doc-specialty">
                                    {doc.specialization}
                                  </div>
                                  <div className="chat-doc-exp">
                                    {doc.experienceYears ? `${doc.experienceYears} yrs experience` : ''} 
                                    {doc.qualification ? ` • ${doc.qualification}` : ''}
                                  </div>
                                </div>
                              </div>

                              {doc.clinicAddress && (
                                <div style={{ fontSize: '0.69rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                  <MapPin size={11} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {doc.clinicAddress}
                                  </span>
                                </div>
                              )}

                              <div className="chat-doc-details">
                                <div className="chat-doc-fee">
                                  ₹{doc.consultationFee || doc.consultationFeeClinic || '400'} <span>/ consultation</span>
                                </div>
                                <button
                                  className="chat-book-btn"
                                  onClick={() => handleNavigateDoctor(doc)}
                                >
                                  Book Appointment <ChevronRight size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clickable Suggestion Chips */}
                      {msg.suggestionChips && msg.suggestionChips.length > 0 && (
                        <div className="chat-chips-scroll">
                          {msg.suggestionChips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              className="chat-chip"
                              onClick={() => handleSendMessage(chip)}
                              disabled={loading}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="chat-time">{msg.timestamp}</div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="chat-row chat-row-assistant">
                  <div className="chat-avatar-bot">
                    <Bot size={17} />
                  </div>
                  <div className="chat-bubble chat-bubble-assistant">
                    <div className="chat-typing">
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" />
                      <span className="chat-typing-dot" />
                      <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: 6 }}>
                        Analyzing clinical symptoms...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="chatbot-footer">
              <form
                className="chatbot-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="chatbot-input"
                  placeholder="Describe symptoms or ask about appointments..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="chatbot-send-btn"
                  disabled={!input.trim() || loading}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="chatbot-disclaimer">
                Spring AI Medical Assistant · For informational triage. Always consult a certified physician.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Toggle Button */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Health Assistant"
      >
        <span className="chatbot-fab-pulse" />
        <Bot size={20} />
        <span>AI Health Assistant</span>
        {hasUnread && (
          <span style={{
            background: '#f43f5e',
            color: 'white',
            borderRadius: '50%',
            width: 8,
            height: 8,
            display: 'inline-block'
          }} />
        )}
      </button>
    </div>
  );
}
