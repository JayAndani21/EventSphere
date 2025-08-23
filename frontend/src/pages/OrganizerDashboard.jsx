import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrganizerDashboard.css";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/events/organizer",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Manage Your Events</h1>
          <p className="hero-description">
            Create, track and manage all your events in one place.
          </p>
        </section>

        {/* Categories Grid (for organizer actions) */}
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-header">
              <div className="category-info">
                <h3>Create Event</h3>
                <p>Host a new competition</p>
              </div>
              <span className="category-icon">➕</span>
            </div>
            <button
              className="explore-button"
              onClick={() => navigate("/organize-event")}
            >
              Start →
            </button>
          </div>

          <div className="category-card">
            <div className="category-header">
              <div className="category-info">
                <h3>Track Registrations</h3>
                <p>Monitor participant growth</p>
              </div>
              <span className="category-icon">📊</span>
            </div>
            <button className="explore-button">Explore →</button>
          </div>

          <div className="category-card">
            <div className="category-header">
              <div className="category-info">
                <h3>Manage Submissions</h3>
                <p>Review participant work</p>
              </div>
              <span className="category-icon">📂</span>
            </div>
            <button className="explore-button">Explore →</button>
          </div>

          <div className="category-card">
            <div className="category-header">
              <div className="category-info">
                <h3>Analytics</h3>
                <p>Measure event success</p>
              </div>
              <span className="category-icon">📈</span>
            </div>
            <button className="explore-button">Explore →</button>
          </div>
        </div>

        {/* Organizer’s Events Section */}
        <section className="competitions-section">
          <div className="section-header">
            <h2 className="section-title">Your Events</h2>
            <button className="explore-button">View all →</button>
          </div>

          <div className="events-grid">
            {events.length === 0 ? (
              <p className="no-events-text">No events created yet.</p>
            ) : (
              events.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-image">
                    <img
                      src={event.image || "https://via.placeholder.com/400x225"}
                      alt={event.title}
                    />
                  </div>
                  <div className="event-details">
                    <div className="event-tags">
                      <span className="tag tag-online">Online</span>
                      <span className="tag tag-free">Free</span>
                    </div>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-organizer">{event.organizer}</p>
                    <div className="event-meta">
                      <div className="meta-info">
                        <div className="meta-item">
                          <span>👥</span>
                          <span>
                            {event.registrations?.length || 0} Registrations
                          </span>
                        </div>
                        <div className="meta-item meta-days">
                          <span className="clock-icon">⏰</span>
                          <span>7 days left</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Arrow Button */}
                  <button className="arrow-button">↗</button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
