import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/ContestRegistrationPage.css";

const formatDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (iso) => {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const Countdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, new Date(endDate) - new Date()));

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(Math.max(0, new Date(endDate) - new Date())), 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const sec = Math.floor(timeLeft / 1000);
  const days = Math.floor(sec / (3600 * 24));
  const hours = Math.floor((sec % (3600 * 24)) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  if (timeLeft === 0) {
    return <div className="countdown-ended">Contest Ended</div>;
  }

  return (
    <div className="countdown">
      {days > 0 && (
        <div className="count-item">
          <div className="count-num">{days}</div>
          <div className="count-label">Days</div>
        </div>
      )}
      <div className="count-item">
        <div className="count-num">{hours.toString().padStart(2, "0")}</div>
        <div className="count-label">Hours</div>
      </div>
      <div className="count-item">
        <div className="count-num">{minutes.toString().padStart(2, "0")}</div>
        <div className="count-label">Min</div>
      </div>
      <div className="count-item">
        <div className="count-num">{seconds.toString().padStart(2, "0")}</div>
        <div className="count-label">Sec</div>
      </div>
    </div>
  );
};

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = display;
    const to = value;
    const duration = 600;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(Math.floor(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display}</span>;
};

export default function ContestPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [contest, setContest] = useState(location.state?.contest || null);
  const [loading, setLoading] = useState(!contest);
  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const shareRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const fetchContest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch contest details
      const res = await fetch(`http://localhost:5000/api/contests/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to load contest");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setContest(data.contest || data);
      
      // Check if user is registered
      if (token) {
        await checkRegistrationStatus(token);
      } else {
        setCheckingRegistration(false);
      }
    } catch (err) {
      console.error("Error fetching contest:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async (token) => {
    try {
      setCheckingRegistration(true);
      console.log("🔍 Checking registration for contest:", id);
      
      const regRes = await fetch(`http://localhost:5000/api/participants/${id}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📡 API Response Status:", regRes.status);
      
      if (regRes.ok) {
        const participants = await regRes.json();
        console.log("👥 All Participants:", participants);
        
        // Get user email from localStorage as primary identifier
        const userEmail = localStorage.getItem("userEmail");
        console.log("📧 Current User Email from localStorage:", userEmail);
        
        // Also try to decode token for additional verification
        let tokenEmail = null;
        let tokenUserId = null;
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          tokenEmail = decoded.email;
          tokenUserId = decoded.id || decoded._id || decoded.userId;
          console.log("🔑 Decoded Token - Email:", tokenEmail, "UserId:", tokenUserId);
        } catch (e) {
          console.error("❌ Error decoding token:", e);
        }
        
        // Check if user is in the participants array
        let found = false;
        if (Array.isArray(participants)) {
          console.log("🔎 Checking through", participants.length, "participants...");
          
          found = participants.some((p) => {
            console.log("Checking participant:", {
              userEmail: p.userEmail,
              userId_id: p.userId?._id,
              userId_email: p.userId?.email
            });
            
            // Check by email (most reliable)
            if (userEmail && (p.userEmail === userEmail || p.userId?.email === userEmail)) {
              console.log("✅ Match found by email!");
              return true;
            }
            
            // Fallback: Check by userId
            if (tokenUserId) {
              const participantId = p.userId?._id || p.userId;
              if (participantId === tokenUserId) {
                console.log("✅ Match found by userId!");
                return true;
              }
            }
            
            return false;
          });
        } else {
          console.warn("⚠️ Participants is not an array:", participants);
        }
        
        console.log("🎯 Final Registration Status:", found);
        setIsRegistered(found);
      } else {
        console.error("❌ API request failed with status:", regRes.status);
      }
    } catch (err) {
      console.error("❌ Error checking registration:", err);
    } finally {
      console.log("✅ Setting checkingRegistration to false");
      setCheckingRegistration(false);
    }
  };

  useEffect(() => {
    console.log("🚀 Component mounted, fetching contest...");
    fetchContest();
  }, [id]);

  useEffect(() => {
    console.log("🔄 State update - checkingRegistration:", checkingRegistration, "isRegistered:", isRegistered);
  }, [checkingRegistration, isRegistered]);

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setRegistering(true);
      const res = await fetch(`http://localhost:5000/api/participants/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setModalOpen(false);
        setIsRegistered(true);
        await fetchContest();
        showToast("Registered successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.message || "Registration failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Registration failed", "error");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Are you sure you want to unregister from this contest?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/participants/${id}/unregister`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setIsRegistered(false);
        await fetchContest();
        showToast("Unregistered successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.message || "Unregistration failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Unregistration failed", "error");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const el = shareRef.current;
      if (el) {
        el.textContent = "✓ Copied!";
        setTimeout(() => (el.textContent = "Share"), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container loading-state">Loading contest...</div>;
  if (!contest) return <div className="container error-state">Contest not found</div>;

  const {
    name,
    description,
    organizer,
    startDate,
    endDate,
    allowedLanguages = [],
    prize,
    rules,
    stats = {},
  } = contest;

  const totalParticipants = stats.totalParticipants || 0;
  const totalSubmissions = stats.totalSubmissions || 0;

  const parsePrizes = (prizeText) => {
    if (!prizeText) return [];
    const lines = prizeText.split(/\s{2,}/).filter(Boolean);
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const amount = parts[parts.length - 1];
        const rank = parts.slice(0, -1).join(' ');
        return { rank, amount };
      }
      return null;
    }).filter(Boolean);
  };

  const prizes = parsePrizes(prize);

  return (
    <div className="dashboard">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === "success" ? (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="contest-page-new">
          {/* Hero Section */}
          <div className="contest-hero">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              {contest.isActive ? "Live Now" : "Upcoming"}
            </div>
            <h1 className="hero-title">{name}</h1>
            <div className="hero-organizer">
              <div className="organizer-avatar">
                {organizer?.fullName?.slice(0, 2).toUpperCase() || "CT"}
              </div>
              <span>Organized by {organizer?.fullName || organizer?.email}</span>
            </div>
            
            <div className="hero-meta">
              <div className="meta-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="14" height="14" rx="2" />
                  <path d="M3 8h14M7 2v4M13 2v4" />
                </svg>
                <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
              </div>
              <div className="meta-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="7" />
                  <path d="M10 6v4l3 2" />
                </svg>
                <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
              </div>
              <div className="meta-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                <span><AnimatedNumber value={totalParticipants} /> Participants</span>
              </div>
            </div>

            <div className="hero-actions">
              <Countdown endDate={endDate} />
              <div className="action-buttons">
                {checkingRegistration ? (
                  <button className="btn-primary" disabled>
                    Checking...
                  </button>
                ) : isRegistered ? (
                  <button className="btn-danger" onClick={handleUnregister}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="17" y1="8" x2="23" y2="14" />
                      <line x1="23" y1="8" x2="17" y2="14" />
                    </svg>
                    Unregister
                  </button>
                ) : (
                  <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Register Now
                  </button>
                )}
                <button className="btn-secondary" onClick={copyLink} ref={shareRef}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="contest-nav">
            <button 
              className={activeTab === "overview" ? "active" : ""} 
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button 
              className={activeTab === "prizes" ? "active" : ""} 
              onClick={() => setActiveTab("prizes")}
            >
              Prizes
            </button>
            <button 
              className={activeTab === "rules" ? "active" : ""} 
              onClick={() => setActiveTab("rules")}
            >
              Rules
            </button>
          </nav>

          {/* Content Area */}
          <div className="contest-content">
            {activeTab === "overview" && (
              <div className="content-grid">
                <div className="content-main">
                  <div className="info-card">
                    <h2>About This Contest</h2>
                    <div className="description-text">{description}</div>
                  </div>

                  <div className="info-card">
                    <h2>Programming Languages</h2>
                    <div className="languages-grid">
                      {allowedLanguages.map((lang) => (
                        <div key={lang} className="language-chip">
                          <div className="lang-icon">{lang.slice(0, 1).toUpperCase()}</div>
                          <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="content-sidebar">
                  <div className="stats-card">
                    <h3>Contest Stats</h3>
                    <div className="stat-row">
                      <span className="stat-label">Status</span>
                      <span className="stat-value status-badge">
                        {contest.isActive ? "🟢 Open" : "🔴 Closed"}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Registration</span>
                      <span className="stat-value status-badge" style={{
                        background: isRegistered ? '#dcfce7' : '#fee2e2',
                        color: isRegistered ? '#166534' : '#991b1b'
                      }}>
                        {isRegistered ? "✓ Registered" : "Not Registered"}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Visibility</span>
                      <span className="stat-value">{contest.visibility || "Public"}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Participants</span>
                      <span className="stat-value stat-number">
                        <AnimatedNumber value={totalParticipants} />
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Submissions</span>
                      <span className="stat-value stat-number">
                        <AnimatedNumber value={totalSubmissions} />
                      </span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Max Submissions</span>
                      <span className="stat-value">{contest.maxSubmissions || "Unlimited"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "prizes" && (
              <div className="content-main single">
                <div className="info-card">
                  <h2>Prize Distribution</h2>
                  {prizes.length > 0 ? (
                    <div className="prizes-table">
                      {prizes.map((p, i) => (
                        <div key={i} className="prize-row">
                          <div className="prize-rank">
                            {i < 3 && <span className="medal">🏆</span>}
                            <span>{p.rank}</span>
                          </div>
                          <div className="prize-amount">{p.amount}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">No prize information available</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="content-main single">
                <div className="info-card">
                  <h2>Contest Rules</h2>
                  <div className="rules-content">{rules}</div>
                </div>
              </div>
            )}
          </div>

          {/* Registration Modal */}
          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Register for Contest</h3>
                  <button className="modal-close" onClick={() => setModalOpen(false)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="modal-body">
                  <p>You're about to register for <strong>{name}</strong></p>
                  <p className="modal-note">Make sure you're available during the contest period.</p>
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleRegister} disabled={registering}>
                    {registering ? "Registering..." : "Confirm Registration"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}