import React, { useState } from "react";
import "../styles/TicketPage.css";

const TicketPage = () => {
  const [emailReminder, setEmailReminder] = useState(true);
  const [whatsappReminder, setWhatsappReminder] = useState(false);

  const event = {
    title: "Tech Innovation Summit 2025",
    date: "March 15, 2025",
    time: "2:00 PM - 6:00 PM",
    venue: "Convention Center West",
    address: "123 Innovation Drive, San Francisco, CA 94103",
    seatInfo: "Section A, Row 5, Seat 12",
    ticketNumber: "TIS2025-001234",
  };

  return (
    <div className="ticket-container">
      <div className="ticket-wrapper">
        <div className="ticket-card">
          <div className="ticket-header">
            <h1 className="event-title">{event.title}</h1>
          </div>

          <div className="ticket-body">
            <div className="ticket-content">
              <div className="event-details">
                <div className="detail-item">
                  <div className="icon calendar-icon">📅</div>
                  <div className="detail-text">
                    <p className="detail-primary">{event.date}</p>
                    <p className="detail-secondary">{event.time}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="icon location-icon">📍</div>
                  <div className="detail-text">
                    <p className="detail-primary">{event.venue}</p>
                    <p className="detail-secondary">{event.address}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="icon seat-icon">🎫</div>
                  <div className="detail-text">
                    <p className="detail-secondary">Seat Number</p>
                    <p className="detail-primary">{event.seatInfo}</p>
                  </div>
                </div>
              </div>

              <div className="qr-section">
                <div className="qr-container">
                  <div className="qr-code">
                    <div className="qr-pattern"></div>
                  </div>
                  <p className="qr-label">Digital Ticket</p>
                  <p className="qr-instruction">Scan at venue entrance</p>
                  <p className="ticket-number">{event.ticketNumber}</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-primary">
                {/* <span className="btn-icon">⬇️</span> */}
                Download PDF Ticket
              </button>
              <button className="btn-secondary">
                <span className="btn-icon">📅</span>
                Add to Calendar
              </button>
            </div>
          </div>
        </div>

        <div className="reminder-card">
          <h3 className="reminder-title">Event Reminders</h3>
          <div className="reminder-options">
            <div className="reminder-item">
              <div className="reminder-info">
                <div className="reminder-icon email-icon">✉️</div>
                <div>
                  <p className="reminder-label">Email Reminder</p>
                  <p className="reminder-desc">Get notified via email</p>
                </div>
              </div>
              <button
                onClick={() => setEmailReminder(!emailReminder)}
                className={`toggle ${emailReminder ? "toggle-active" : ""}`}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="reminder-item">
              <div className="reminder-info">
                <div className="reminder-icon whatsapp-icon">💬</div>
                <div>
                  <p className="reminder-label">WhatsApp Reminder</p>
                  <p className="reminder-desc">Get notified via WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappReminder(!whatsappReminder)}
                className={`toggle ${whatsappReminder ? "toggle-active" : ""}`}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>

          <div className="reminder-schedule">
            <p>
              <strong>Reminder Schedule:</strong> You'll receive notifications 1
              day before, 2 hours before, and 30 minutes before the event starts.
            </p>
          </div>
        </div>

        <div className="info-card">
          <h3 className="info-title">Important Information</h3>
          <div className="info-grid">
            <div>
              <h4 className="info-subtitle">Entry Requirements</h4>
              <ul className="info-list">
                <li>• Valid government-issued ID required</li>
                <li>• Arrive 30 minutes before event time</li>
                <li>• Present digital or printed ticket</li>
              </ul>
            </div>
            <div>
              <h4 className="info-subtitle">Event Guidelines</h4>
              <ul className="info-list">
                <li>• No outside food or beverages</li>
                <li>• Photography may be restricted</li>
                <li>• Dress code: Business casual</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
