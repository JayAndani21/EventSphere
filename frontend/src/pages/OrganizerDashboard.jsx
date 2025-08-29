import React from "react";
import "../styles/OrganizerDashboard.css";
import { Calendar, Users, Ticket, Plus, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const Dashboard = () => {
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
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">EventSphere</h2>
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
      <main className="main">
        {/* Header */}
        <header className="header">
          <h1>Organizer Dashboard</h1>
          <div className="actions">
            <Link to="/create-event">
              <button className="btn">
                <Plus size={16} /> Create Event
              </button>
            </Link>
            <Link to="/create-contest">
              <button className="btn">
                <Plus size={16} /> Create Contest
              </button>
            </Link>
            <button className="btn"><Users size={16} /> Upload Guests</button>
            <button className="btn"><Ticket size={16} /> Generate Tickets</button>
          </div>
        </header>

        {/* Upcoming Events */}
        <section className="event-section">
          <div className="event-cards">
            {events.map((event, i) => (
              <div key={i} className="event-card">
                <img src={event.image} alt={event.title} className="event-image" />
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p>{event.date}</p>
                  <p>{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar */}
        <section className="calendar">
          <div className="calendar-box">(Drag-and-Drop Calendar View)</div>
        </section>

        {/* Analytics */}
        <section className="analytics">
          <div className="chart">📊 Ticket Sales (Chart)</div>
          <div className="chart">📈 Monthly Revenue (Chart)</div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
