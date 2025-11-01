import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ContestList.css"; // updated file name

const MyContests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyContests();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchMyContests = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/participants/my-contests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContests(Array.isArray(data) ? data : data.contests || []);
      } else console.error("Failed to fetch my contests");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (contestId) => {
    if (!window.confirm("Are you sure you want to unregister from this contest?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/participants/${contestId}/unregister`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchMyContests();
        showToast("Unregistered successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.message || "Unregistration failed", "error");
      }
    } catch {
      showToast("Unregistration failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="mycontest-wrapper">
        <div className="mycontest-list">
          <div className="mycontest-loading">
            <div className="mycontest-spinner"></div>
            <p>Loading your contests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mycontest-wrapper">
      {toast.show && (
        <div className={`mycontest-toast mycontest-toast-${toast.type}`}>
          <div className="mycontest-toast-content">
            {toast.type === "success" ? (
              <svg className="mycontest-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg className="mycontest-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mycontest-list">
        <div className="mycontest-header">
          <h2>My Registered Contests</h2>
          {contests.length > 0 && (
            <div className="mycontest-count">
              {contests.length} {contests.length === 1 ? "Contest" : "Contests"}
            </div>
          )}
        </div>

        {contests.length === 0 ? (
          <div className="mycontest-empty">
            <div className="mycontest-empty-icon">📋</div>
            <h3>No Contests Yet</h3>
            <p>You haven't registered for any contests.</p>
            <button className="mycontest-browse-btn" onClick={() => navigate("/contests")}>
              Browse Contests
            </button>
          </div>
        ) : (
          <div className="mycontest-grid">
            {contests.map((pc) => {
              const contest = pc.contestId || pc;
              const startDate = new Date(contest.startDate);
              const isUpcoming = startDate > new Date();
              return (
                <div key={contest._id} className="mycontest-card">
                  <div className="mycontest-card-header">
                    <h3>{contest.name}</h3>
                    {isUpcoming && <span className="mycontest-upcoming">Upcoming</span>}
                  </div>

                  <div className="mycontest-card-body">
                    <div className="mycontest-date">
                      <svg className="mycontest-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <div>
                        <div className="mycontest-date-label">Starts</div>
                        <div className="mycontest-date-value">{startDate.toLocaleDateString()}</div>
                        <div className="mycontest-time-value">
                          {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mycontest-card-footer">
                    <button className="mycontest-enter-btn" onClick={() => navigate(`/contest/${contest._id}/problems`)}>
                      <span>Enter Contest</span>
                      <svg className="mycontest-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                    <button className="mycontest-unregister-btn" onClick={() => handleUnregister(contest._id)}>
                      <svg className="mycontest-cross-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span>Unregister</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContests;
