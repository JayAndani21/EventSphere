import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchContests()]);
    setLoading(false);
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/events/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);

      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch all contests
  const fetchContests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contests/");
      if (response.ok) {
        const data = await response.json();
        setContests(Array.isArray(data.contests) ? data.contests : []);
      } else {
        console.error("Failed to fetch contests");
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  // Register for event
  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Registered successfully!");
        fetchEvents();
      } else {
        const data = await response.json();
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  const categories = [
  { key: "hackathon", name: "Hackathons", icon: "💻", color: "#7c5ce0", count: events.filter(e => e.category === "Hackathon"&& e.status==="published").length },
  { key: "seminar", name: "Seminars", icon: "🎤", color: "#8b5cf6", count: events.filter(e => e.category === "Seminar"&&e.status==="published").length },
  { key: "workshop", name: "Workshops", icon: "🎓", color: "#10b981", count: events.filter(e => e.category === "Workshop"&&e.status==="published").length },
  { key: "concert", name: "Concerts", icon: "🎵", color: "#ef4444", count: events.filter(e => e.category === "Concert"&&e.status==="published").length },

];


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading events and contests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Discover Opportunities
          </div>
          <h1 className="hero-title">Unlock Your Career Potential</h1>
          <p className="hero-description">
            Explore opportunities from across the globe to grow, showcase your skills,
            gain CV points & get hired by your dream company.
          </p>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                style={{ "--category-color": cat.color }}
                onClick={() => navigate(`/events?category=${cat.key}`)}
              >
                <div className="category-icon-wrapper">
                  <span className="category-icon">{cat.icon}</span>
                </div>

                <div className="category-content">
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-count">{cat.count} Available</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Events Section */}
        <section className="content-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Events</h2>
              <p className="section-subtitle">Join exciting events and boost your career</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/events")}>
              View All
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M10 5l5 5-5 5" />
              </svg>
            </button>
          </div>
          <div className="events-grid-four">
            {Array.isArray(events) && events.length > 0 ? (
              events
                .filter(event => event.status !== "draft" && event.status !== "cancelled")
                .slice(0, 4)
                .map(event => (
                  <div key={event._id} className="modern-event-card">
                    <div
                      className="event-card-image"
                      style={{
                        backgroundImage: `url(${event.coverImageUrl || "https://via.placeholder.com/400x225"
                          })`,
                      }}
                    >
                      <div className="event-card-overlay">
                        <button
                          className="quick-register-btn"
                          onClick={() => handleRegister(event._id)}
                        >
                          Register Now
                        </button>
                      </div>
                    </div>
                    <div className="event-card-content">
                      <div className="event-card-tags">
                        <span className="event-tag online">{event.eventType}</span>
                      </div>
                      <h3 className="event-card-title">{event.eventName}</h3>
                      <p className="event-card-organizer">
                        by {event.organizer ? event.organizer.email : event.organizerName}
                      </p>
                      <div className="event-card-footer">
                        <div className="event-card-info">
                          <span className="info-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 1v2M5 1v2M2 5h12M3 3h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
                            </svg>
                            {formatDate(event.date || event.startDate)}
                          </span>
                          <span className="info-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 7A7 7 0 11 2 7a7 7 0 0114 0z" />
                              <path d="M8 3v5l3 2" />
                            </svg>
                            {formatTime(event.date)}
                          </span>
                        </div>
                        <div className="attendees-count">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 13v-1a3 3 0 00-3-3H4a3 3 0 00-3 3v1" />
                            <circle cx="6" cy="5" r="3" />
                            <path d="M15 13v-1a3 3 0 00-2-2.8M11 1.1a3 3 0 010 5.8" />
                          </svg>
                          {event.attendeesCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No events available at the moment</p>
              </div>
            )}
          </div>
        </section>

        {/* Contests Section */}
        <section className="content-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Coding Contests</h2>
              <p className="section-subtitle">Challenge yourself and compete with the best</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/contests")}>
              View All
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M10 5l5 5-5 5" />
              </svg>
            </button>
          </div>
          <div className="events-grid-four">
            {Array.isArray(contests) && contests.length > 0 ? (
              contests.slice(0, 4).map((contest) => (
                <div key={contest._id} className="modern-event-card">
                  <div
                    className="event-card-image"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #7c5ce0 0%, #9378ea 100%)",
                    }}
                  >
                    <div className="contest-badge">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                      Contest
                    </div>
                    <div className="event-card-overlay">
                      <button
                        className="quick-register-btn"
                        onClick={() => navigate(`/contest/${contest._id}`, { state: { contest } })}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="event-card-content">
                    <div className="event-card-tags">
                      <span className="event-tag contest-tag">
                        {contest.isActive ? "🟢 Live" : "📅 Upcoming"}
                      </span>
                    </div>
                    <h3 className="event-card-title">{contest.name}</h3>
                    <p className="event-card-organizer">
                      by {contest.organizer?.fullName || "Contest Organizer"}
                    </p>
                    <div className="event-card-footer">
                      <div className="event-card-info">
                        <span className="info-item">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 1v2M5 1v2M2 5h12M3 3h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
                          </svg>
                          {formatDate(contest.startDate)}
                        </span>
                        <span className="info-item">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 7A7 7 0 11 2 7a7 7 0 0114 0z" />
                            <path d="M8 3v5l3 2" />
                          </svg>
                          {formatTime(contest.startDate)}
                        </span>
                      </div>
                      <div className="attendees-count">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 13v-1a3 3 0 00-3-3H4a3 3 0 00-3 3v1" />
                          <circle cx="6" cy="5" r="3" />
                          <path d="M15 13v-1a3 3 0 00-2-2.8M11 1.1a3 3 0 010 5.8" />
                        </svg>
                        {contest.stats?.totalParticipants || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p>No contests available at the moment</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AttendeeDashboard;