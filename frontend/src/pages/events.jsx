import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/events.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/events/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const filteredEvents = events
    .filter(event => event.status !== "draft" && event.status !== "cancelled")
    .filter(event =>
      event.eventName.toLowerCase().includes(search.toLowerCase())
    )
    .filter(event =>
      category === "all" ? true : event.category?.toLowerCase() === category.toLowerCase()
    );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="dashboard-content" style={{ paddingTop: "40px" }}>
      {/* Page Title */}
      <h1 className="section-title" style={{ marginBottom: "8px" }}>Explore Events</h1>
      <p className="section-subtitle">Find events that match your interest & goals</p>

      {/* Search & Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search events..."
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="hackathon">Hackathon</option>
          <option value="workshop">Workshop</option>
          <option value="college">College Event</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* Events Grid */}
      <div className="events-grid-four">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event._id} className="modern-event-card">
              <div
                className="event-card-image"
                style={{
                  backgroundImage: `url(${event.coverImageUrl || "https://via.placeholder.com/400x225"})`,
                }}
                onClick={() => navigate(`/event/${event._id}`)}
              ></div>

              <div className="event-card-content">
                <div className="event-card-tags">
                  <span className="event-tag online">{event.eventType}</span>
                </div>

                <h3 className="event-card-title">{event.eventName}</h3>
                <p className="event-card-organizer">
                  by {event.organizer?.email || event.organizerName}
                </p>

                <div className="event-card-footer">
                  <div className="event-card-info">
                    <span className="info-item">
                      {formatDate(event.date)}
                    </span>
                    <span className="info-item">
                      {formatTime(`${event.date}T${event.time}`)}
                    </span>
                  </div>

                  <div className="attendees-count">
                    👥 {event.attendeesCount || 0}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "40px" }}>No events found</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
