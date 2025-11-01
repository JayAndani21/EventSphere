import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";

const OrganizerManagement = () => {
  const [organizers, setOrganizers] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingEvents, setViewingEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events/all");
        const data = await res.json();
        console.log("📦 EVENTS:", data);

        if (data.success && Array.isArray(data.data)) {
          // Group events by organizerEmail
          const grouped = {};
          data.data.forEach((event) => {
            const email = event.organizerEmail || "unknown@domain.com";
            if (!grouped[email]) {
              grouped[email] = {
                organization_name: event.organizerName || "Unnamed Organizer",
                email,
                status: event.status || "pending",
                created_at: event.createdAt,
                events: [],
              };
            }
            grouped[email].events.push({
              id: event._id,
              name: event.eventName,
              type: event.eventType,
              event_date: event.date,
              status: event.status,
              tickets_issued: event.attendeesCount,
              capacity: event.capacity,
            });

            // Update earliest created_at date
            const currentDate = new Date(grouped[email].created_at);
            const newDate = new Date(event.createdAt);
            if (newDate < currentDate) grouped[email].created_at = event.createdAt;
          });

          // Convert to array
          const organizersList = Object.values(grouped).map((org, index) => ({
            id: index + 1,
            organization_name: org.organization_name,
            users: { email: org.email },
            events_created: org.events.length,
            status: org.status,
            created_at: org.created_at,
            events: org.events,
          }));

          setOrganizers(organizersList);
          setFilteredOrganizers(organizersList);
        }
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle filtering
  useEffect(() => {
    let filtered = [...organizers];

    if (searchTerm) {
      filtered = filtered.filter(
        (org) =>
          org.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((org) => org.status === statusFilter);
    }

    setFilteredOrganizers(filtered);
  }, [searchTerm, statusFilter, organizers]);

  if (loading) return <div>Loading organizers...</div>;

  return (
    <div>
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Organizer Management</h2>
        </div>

        <div className="search-filter-bar">
          <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7C6BA5",
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search by organizer or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Email</th>
                <th>Events Created</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizers.map((org) => (
                <tr key={org.id}>
                  <td>{org.organization_name}</td>
                  <td>{org.users.email}</td>
                  <td>{org.events_created}</td>
                  <td>
                    <span className={`status-badge status-${org.status}`}>
                      {org.status}
                    </span>
                  </td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => setViewingEvents(org)}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrganizers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-text">No organizers found</div>
            </div>
          )}
        </div>
      </div>

      {viewingEvents && (
        <div className="modal-overlay" onClick={() => setViewingEvents(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px" }}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                Events by {viewingEvents.organization_name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setViewingEvents(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {viewingEvents.events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-text">No events created yet</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingEvents.events.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.name}</td>
                        <td>{ev.type}</td>
                        <td>{new Date(ev.event_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${ev.status}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td>
                          {ev.tickets_issued} / {ev.capacity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerManagement;
