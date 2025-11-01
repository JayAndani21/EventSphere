import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/contest.css";

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get category from URL
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get("category");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/contests/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setContests(data.data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const filteredContests = contests
    .filter(c => c.status !== "draft" && c.status !== "cancelled")
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => categoryFilter ? c.category?.toLowerCase() === categoryFilter.toLowerCase() : true);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });

  return (
    <div className="contests-page">
      <h1 className="contests-title">All Contests</h1>
      <p className="contests-subtitle">Search & participate in exciting contests</p>

      {/* ✅ Search Input */}
      <div className="contest-search-box">
        <input
          type="text"
          placeholder="Search contests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ✅ Show Applied Filter */}
      {categoryFilter && (
        <p className="applied-filter">Filtered by: <strong>{categoryFilter}</strong></p>
      )}

      <div className="contests-grid">
        {filteredContests.length > 0 ? (
          filteredContests.map(contest => (
            <div key={contest._id} className="contest-card">
              <div
                className="contest-card-image"
                style={{ backgroundImage: `url(${contest.bannerImage || "https://via.placeholder.com/400x225"})` }}
                onClick={() => navigate(`/contest/${contest._id}`)}
              />

              <div className="contest-card-content">
                <h3 className="contest-card-title">{contest.title}</h3>
                <p className="contest-card-organizer">
                  Hosted by {contest.organizerName || "Unknown"}
                </p>
                <div className="contest-card-footer">
                  <span className="contest-date">{formatDate(contest.startDate)}</span>
                  <span className="contest-prize">🏆 {contest.prize ? `₹${contest.prize}` : "No Prize"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "40px" }}>No contests found</p>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
