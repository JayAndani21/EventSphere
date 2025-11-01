import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/contest.css";

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get("category");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contests/");
      if (response.ok) {
        const data = await response.json();

        const formatted = (data.contests || []).map((c) => ({
          _id: c._id,
          title: c.name,
          bannerImage: c.bannerImage || "",
          startDate: c.startDate,
          endDate: c.endDate,
          prize: c.prize,
          organizerName: c.organizer?.fullName || "Unknown",
          status: c.status,
          category: c.visibility,
          stats: c.stats || {},
          isActive: c.isActive,
        }));

        setContests(formatted);
      } else {
        console.error("Failed to fetch contests");
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const filteredContests = contests
    .filter((c) => c.status !== "draft" && c.status !== "cancelled")
    .filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()))
    .filter((c) =>
      categoryFilter
        ? c.category?.toLowerCase() === categoryFilter.toLowerCase()
        : true
    );

  // --- Formatters ---
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="contests-page">
      <h1 className="contests-title">All Contests</h1>
      <p className="contests-subtitle">
        Search & participate in exciting contests
      </p>

      {/* Search Input */}
      <div className="contest-search-box">
        <input
          type="text"
          placeholder="Search contests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {categoryFilter && (
        <p className="applied-filter">
          Filtered by: <strong>{categoryFilter}</strong>
        </p>
      )}

      <div className="contests-grid">
        {filteredContests.length > 0 ? (
          filteredContests.map((contest) => (
            <div key={contest._id} className="modern-event-card">
              <div
                className="event-card-image"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7c5ce0 0%, #9378ea 100%)",
                }}
              >
                <div className="contest-badge">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  Contest
                </div>
                <div className="event-card-overlay">
                  <button
                    className="quick-register-btn"
                    onClick={() =>
                      navigate(`/contest/${contest._id}`, { state: { contest } })
                    }
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
                <h3 className="event-card-title">{contest.title}</h3>
                <p className="event-card-organizer">
                  by {contest.organizerName || "Contest Organizer"}
                </p>
                <div className="event-card-footer">
                  <div className="event-card-info">
                    <span className="info-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 1v2M5 1v2M2 5h12M3 3h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
                      </svg>
                      {formatDate(contest.startDate)}
                    </span>
                    <span className="info-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M16 7A7 7 0 11 2 7a7 7 0 0114 0z" />
                        <path d="M8 3v5l3 2" />
                      </svg>
                      {formatTime(contest.startDate)}
                    </span>
                  </div>
                  <div className="attendees-count">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
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
          <p className="no-contests">No contests found</p>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
