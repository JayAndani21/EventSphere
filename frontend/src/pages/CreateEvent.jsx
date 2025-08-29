import React, { useState, useEffect } from "react";
import "../styles/CreateEvent.css";

const CreateEvent = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let currentDate = new Date().toISOString().split("T")[0]; // today in YYYY-MM-DD format

    if (startDate && new Date(startDate) < new Date(currentDate)) {
      setError("❌ Start date cannot be earlier than today!");
    } 
    else if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      setError("❌ End date cannot be earlier than Start date!");
    } 
    else {
      setError("");
    }
  }, [startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) return;
    alert("✅ Event saved successfully (Draft)!");
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h2 className="form-title">Create New Event</h2>

        <form className="event-form" onSubmit={handleSubmit}>
          {/* Event Title */}
          <div className="form-group">
            <label>Event Title</label>
            <input type="text" placeholder="Enter event title" />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Enter event description"></textarea>
          </div>

          {/* Venue & Cover Image */}
          <div className="form-row">
            <div className="form-group">
              <label>Venue</label>
              <input type="text" placeholder="Enter venue" />
            </div>
            <div className="form-group">
              <label>Cover Image</label>
              <input type="file" />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Ticket Types */}
          <h3 className="ticket-title">Ticket Types</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Breakfast</label>
              <input type="number" placeholder="Enter quantity" />
            </div>
            <div className="form-group">
              <label>Lunch</label>
              <input type="number" placeholder="Enter quantity" />
            </div>
            <div className="form-group">
              <label>Dinner</label>
              <input type="number" placeholder="Enter quantity" />
            </div>
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={!!error}>
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
