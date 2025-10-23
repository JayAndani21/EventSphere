import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ContestList.css";
import "../styles/Problem.css";

const Problem = () => {
  const { id, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, problemId]);

  const fetchProblem = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/contests/${id}/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProblem(data.problem || data);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to load problem");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load problem");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contest-list-wrapper">
        <div className="contest-list">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contest-list-wrapper">
        <div className="contest-list">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Error</h3>
            <p>{error}</p>
            <button className="browse-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contest-list-wrapper">
      <div className="contest-list">
        <div className="contest-header">
          <h2>{problem?.title || problem?.name || "Problem"}</h2>
          <button className="browse-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <div className="contest-card">
          <div className="contest-card-body">
            <p>{problem?.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem;
