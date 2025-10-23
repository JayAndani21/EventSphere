import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ContestList.css";
import "../styles/ProblemList.css";

const ProblemList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptanceCounts, setAcceptanceCounts] = useState({});

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProblems = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/questions/${id}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        // API returns { questions: [...], success: true }
        const list = Array.isArray(data)
          ? data
          : data.questions || data.problems || [];
        setProblems(list);
        
        // Fetch acceptance counts for each problem
        fetchAcceptanceCounts(list, token);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to load problems");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptanceCounts = async (problemsList, token) => {
    const counts = {};
    
    await Promise.all(
      problemsList.map(async (problem) => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/submissions/problem/${problem._id || problem.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.ok) {
            const data = await res.json();
            // Count accepted submissions (assuming API returns submissions with status field)
            const acceptedCount = data.submissions 
              ? data.submissions.filter(sub => sub.status === "Accepted").length
              : 0;
            counts[problem._id || problem.id] = acceptedCount;
          }
        } catch (err) {
          console.error(`Failed to fetch acceptance count for problem ${problem._id || problem.id}:`, err);
          counts[problem._id || problem.id] = 0;
        }
      })
    );
    
    setAcceptanceCounts(counts);
  };

  if (loading) {
    return (
      <div className="contest-list-wrapper">
        <div className="contest-list">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contest-list-wrapper">
      <div className="contest-list">
        <div className="contest-header">
          <h2>Problems for Contest</h2>
          <button className="browse-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
        {error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Problems</h3>
            <p>There are no problems for this contest.</p>
          </div>
        ) : (
          <div className="problems-list">
            {problems.map((p, index) => (
              <div key={p._id || p.id} className="problem-item">
                <div className="problem-left">
                  <span className="problem-letter">{String.fromCharCode(65 + index)}</span>
                  <h3 className="problem-title">{p.title || p.name}</h3>
                </div>
                <div className="problem-right">
                  <span className="acceptance-count">
                    ✓ {acceptanceCounts[p._id || p.id] || 0} accepted
                  </span>
                  {/* {p.difficulty && (
                    // <span className={`difficulty-badge ${String(p.difficulty).toLowerCase()}`}>
                    //   {p.difficulty}
                    // </span>
                  )} */}
                  <button
                    className="open-btn"
                    onClick={() => navigate(`/contest/${id}/problem/${p._id || p.id}`)}
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemList;