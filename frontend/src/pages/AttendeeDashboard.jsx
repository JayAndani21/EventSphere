import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const AttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

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
        fetchEvents(); // refresh events after registration
      } else {
        const data = await response.json();
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Unlock Your Career</h1>
          <p className="hero-description">
            Explore opportunities from across the globe to grow, showcase skills,
            gain CV points & get hired by your dream company.
          </p>
        </section>

        {/* Categories Grid */}
        <div className="categories-grid">
          {["Hackathons", "Coding Contests", "Quizzes", "College Events"].map(
            (cat) => (
              <div key={cat} className="category-card">
                <div className="category-header">
                  <div className="category-info">
                    <h3>{cat}</h3>
                    <p>{`Explore ${cat.toLowerCase()}`}</p>
                  </div>
                  <span className="category-icon">🎯</span>
                </div>
                <button className="explore-button">Explore →</button>
              </div>
            )
          )}
        </div>

        {/* Events Section */}
        <section className="competitions-section">
          <div className="section-header">
            <h2 className="section-title">Available Events</h2>
          </div>
          <div className="events-grid">
            {Array.isArray(events) && events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="event-card">
                  <div
                    className="event-image"
                    style={{
                      backgroundImage: `url(${
                        event.coverImageUrl ||
                        "https://via.placeholder.com/400x225"
                      })`,
                    }}
                  ></div>
                  <div className="event-details">
                    <h3 className="event-title">{event.eventName}</h3>
                    <p className="event-organizer">
                      {event.organizer
                        ? event.organizer.email
                        : event.organizerName}
                    </p>
                    <div className="event-meta">
                      <span>👥 {event.attendeesCount || 0} Applied</span>
                    </div>
                  </div>
                  <button
                    className="arrow-button"
                    onClick={() => handleRegister(event._id)}
                  >
                    ↗
                  </button>
                </div>
              ))
            ) : (
              <p>No events available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AttendeeDashboard;
