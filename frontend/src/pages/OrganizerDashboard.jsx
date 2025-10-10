import React from "react";
import "../styles/OrganizerDashboard.css";
import { Calendar, Users, Ticket, Plus, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const OrganizerDashboard = () => {
  const events = [
    {
      title: "Corporate Gala",
      date: "2025-09-30",
      location: "New York",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
    },
    {
      title: "Tech Conference",
      date: "2025-10-12",
      location: "San Francisco",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df"
    },
    {
      title: "Music Festival",
      date: "2025-11-05",
      location: "Los Angeles",
      image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2"
    },
  ];

  const handleDateClick = (info) => {
    const title = prompt("Enter Event Title:");
    if (title) {
      setEvents([...events, { id: Date.now(), title, date: info.dateStr }]);
    }
  };

  return (
    <div className="organizer-dashboard">
      {/* Sidebar */}
      <aside className="organizer-sidebar">
        <h2 className="organizer-logo">EventSphere</h2>
        <nav>
          <ul>
            <li><Calendar size={18} /> Dashboard</li>
            <li><Users size={18} /> Guests</li>
            <li><Ticket size={18} /> Tickets</li>
            <li><BarChart2 size={18} /> Analytics</li>
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <main className="organizer-main">
        {/* Header */}
        <header className="organizer-header">
          <h1>Organizer Dashboard</h1>
          <div className="organizer-actions">
            <Link to="/create-event">
              <button className="organizer-btn">
                <Plus size={16} /> Create Event
              </button>
            </Link>
            <Link to="/create-contest">
              <button className="organizer-btn">
                <Plus size={16} /> Create Contest
              </button>
            </Link>
            <button className="organizer-btn"><Users size={16} /> Upload Guests</button>
            <button className="organizer-btn"><Ticket size={16} /> Generate Tickets</button>
          </div>
        </header>

        {/* Upcoming Events */}
        <section className="organizer-event-section">
          <div className="organizer-event-cards">
            {events.map((event, i) => (
              <div key={i} className="organizer-event-card">
                <img src={event.image} alt={event.title} className="organizer-event-image" />
                <div className="organizer-event-info">
                  <h3>{event.title}</h3>
                  <p>{event.date}</p>
                  <p>{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar */}
        <section className="organizer-calendar">
          <div className="organizer-calendar-box">(Drag-and-Drop Calendar View)</div>
        </section>

        {/* Analytics */}
        <section className="organizer-analytics">
          <div className="organizer-chart">📊 Ticket Sales (Chart)</div>
          <div className="organizer-chart">📈 Monthly Revenue (Chart)</div>
        </section>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
