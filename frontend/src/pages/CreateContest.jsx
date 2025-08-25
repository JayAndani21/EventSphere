import React, { useState, useEffect } from "react";
import "../styles/CreateContest.css";
import QuestionForm from "./QuestionForm";

const Stepper = ({ step }) => {
  const items = [
    { label: "DETAILS", icon: "📝" },
    { label: "QUESTIONS", icon: "🧩" },
    { label: "REVIEW", icon: "👀" }
  ];
  
  return (
    <div className="cc-stepper">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`cc-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}
        >
          <div className="cc-step-circle">
            {step > i + 1 ? '✓' : item.icon}
          </div>
          <div className="cc-step-label">
            {i + 1}. {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const Notification = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`cc-notification ${show ? 'show' : ''} ${type}`}>
      {message}
    </div>
  );
};

export default function CreateContest({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [editIdx, setEditIdx] = useState(null);
  const [showQForm, setShowQForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: "public",          // public | private
    password: "",
    start: "",
    end: "",
    allowedLanguages: ["python", "javascript", "java", "cpp"],
    maxSubmissions: 50,
    penalty: 20,
    showLeaderboard: true,
    registrationRequired: false,
    registrationDeadline: "",
    prize: "",
    rules: "",
    questions: [],
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  
  const detailsOK =
    form.name && 
    form.description && 
    form.start && 
    form.end &&
    new Date(form.start) < new Date(form.end) &&
    (form.visibility === "public" || (form.visibility === "private" && form.password));

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleLanguageToggle = (lang) => {
    const current = form.allowedLanguages;
    if (current.includes(lang)) {
      set("allowedLanguages", current.filter(l => l !== lang));
    } else {
      set("allowedLanguages", [...current, lang]);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  const getDifficultyStats = () => {
    const stats = { easy: 0, medium: 0, hard: 0 };
    form.questions.forEach(q => {
      stats[q.difficulty] = (stats[q.difficulty] || 0) + 1;
    });
    return stats;
  };

  const getTotalPoints = () => {
    return form.questions.reduce((sum, q) => sum + q.points, 0);
  };

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '📜' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'c', name: 'C', icon: '🔧' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'kotlin', name: 'Kotlin', icon: '🎯' }
  ];

  return (
    <section className="cc-wrapper">
      <Stepper step={step} />

      {/* STEP 1 – DETAILS */}
      {step === 1 && (
        <div className="cc-card">
          <h2>Create a Coding Contest</h2>

          <label className="cc-label required">
            Contest Name
            <input
              className="cc-input"
              placeholder="e.g. August Algorithm Challenge 2025"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </label>

          <label className="cc-label required">
            Description
            <textarea
              className="cc-textarea"
              rows={4}
              placeholder="Describe your contest objectives, rules, and what participants can expect to learn..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </label>

          <label className="cc-label">
            Contest Rules & Guidelines
            <textarea
              className="cc-textarea"
              rows={3}
              placeholder="Specific rules, code of conduct, and guidelines for participants..."
              value={form.rules}
              onChange={(e) => set("rules", e.target.value)}
            />
          </label>

          <label className="cc-label">
            Prizes & Recognition
            <input
              className="cc-input"
              placeholder="e.g. $500 cash prize for winner, certificates for top 10"
              value={form.prize}
              onChange={(e) => set("prize", e.target.value)}
            />
          </label>

          <label className="cc-label required">
            Visibility
            <div className="cc-radio-row">
              <label 
                className={`cc-radio-item ${form.visibility === 'public' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="vis"
                  value="public"
                  checked={form.visibility === "public"}
                  onChange={() => set("visibility", "public")}
                />
                🌍 Public Contest
              </label>
              <label 
                className={`cc-radio-item ${form.visibility === 'private' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="vis"
                  value="private"
                  checked={form.visibility === "private"}
                  onChange={() => set("visibility", "private")}
                />
                🔒 Private Contest
              </label>
            </div>
          </label>

          {form.visibility === "private" && (
            <label className="cc-label required">
              Access Password
              <input
                type="password"
                className="cc-input"
                placeholder="Set a secure password for private access"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
              />
            </label>
          )}

          <div className="cc-date-grid">
            <label className="cc-label required">
              Contest Start
              <input
                type="datetime-local"
                className="cc-input"
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
                required
              />
            </label>

            <label className="cc-label required">
              Contest End
              <input
                type="datetime-local"
                className="cc-input"
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
                required
              />
            </label>
          </div>

          <label className="cc-label">
            Registration Settings
            <div className="cc-radio-row">
              <label 
                className={`cc-radio-item ${!form.registrationRequired ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="reg"
                  checked={!form.registrationRequired}
                  onChange={() => set("registrationRequired", false)}
                />
                🚀 Open Participation
              </label>
              <label 
                className={`cc-radio-item ${form.registrationRequired ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="reg"
                  checked={form.registrationRequired}
                  onChange={() => set("registrationRequired", true)}
                />
                📝 Registration Required
              </label>
            </div>
          </label>

          {form.registrationRequired && (
            <label className="cc-label">
              Registration Deadline
              <input
                type="datetime-local"
                className="cc-input"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
              />
            </label>
          )}

          <label className="cc-label">
            Allowed Programming Languages
            <div className="cc-radio-row" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem'}}>
              {languages.map(lang => (
                <label 
                  key={lang.id}
                  className={`cc-radio-item ${form.allowedLanguages.includes(lang.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={form.allowedLanguages.includes(lang.id)}
                    onChange={() => handleLanguageToggle(lang.id)}
                  />
                  {lang.icon} {lang.name}
                </label>
              ))}
            </div>
          </label>

          <div className="cc-date-grid">
            <label className="cc-label">
              Max Submissions per Problem
              <input
                type="number"
                className="cc-input"
                min="1"
                max="200"
                value={form.maxSubmissions}
                onChange={(e) => set("maxSubmissions", parseInt(e.target.value))}
              />
            </label>

            <label className="cc-label">
              Wrong Answer Penalty (minutes)
              <input
                type="number"
                className="cc-input"
                min="0"
                max="60"
                value={form.penalty}
                onChange={(e) => set("penalty", parseInt(e.target.value))}
              />
            </label>
          </div>

          <label className="cc-label">
            Contest Features
            <div className="cc-radio-row">
              <label 
                className={`cc-radio-item ${form.showLeaderboard ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={form.showLeaderboard}
                  onChange={(e) => set("showLeaderboard", e.target.checked)}
                />
                🏆 Show Live Leaderboard
              </label>
            </div>
          </label>

          <div className="cc-footer">
            <button
              className="cc-btn primary"
              disabled={!detailsOK}
              onClick={() => {
                if (detailsOK) {
                  setStep(2);
                  showNotification("Contest details saved! Now add some questions.");
                }
              }}
            >
              Next: Add Questions →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 – QUESTIONS */}
      {step === 2 && (
        <>
          <header className="cc-qbar">
            <div>
              <h3>Contest Questions</h3>
              {form.questions.length > 0 && (
                <p style={{margin: 0, color: 'var(--text-light)', fontSize: '0.9rem'}}>
                  {form.questions.length} problem{form.questions.length !== 1 ? 's' : ''} • {getTotalPoints()} total points
                </p>
              )}
            </div>
            <button 
              className="cc-btn primary" 
              onClick={() => setShowQForm(true)}
            >
              ➕ Add Problem
            </button>
          </header>

          {form.questions.length === 0 ? (
            <div className="cc-card" style={{textAlign: 'center', padding: '3rem'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🧩</div>
              <h3 style={{color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>No Problems Yet</h3>
              <p style={{color: 'var(--text-light)', marginBottom: '2rem'}}>
                Start building your contest by adding coding problems. Each problem should test specific algorithms or data structures.
              </p>
              <button 
                className="cc-btn primary" 
                onClick={() => setShowQForm(true)}
              >
                Create First Problem
              </button>
            </div>
          ) : (
            <div className="cc-qgrid">
              {form.questions.map((q, idx) => (
                <div key={idx} className="cc-qcard">
                  <div className="cc-qcard-content">
                    <div className="title">{q.title}</div>
                    <div className={`difficulty ${q.difficulty}`}>
                      {q.difficulty?.toUpperCase()}
                    </div>
                    <div className="meta">
                      🏆 {q.points} points • 
                      👁️ {q.sampleTestCases.length} sample • 
                      🔒 {q.hiddenTestCases.length} hidden • 
                      🏷️ {q.category}
                      {q.tags && q.tags.length > 0 && (
                        <div style={{marginTop: '0.5rem'}}>
                          {q.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              background: 'var(--primary-color)', 
                              color: 'white', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '0.8rem', 
                              fontSize: '0.7rem', 
                              marginRight: '0.3rem'
                            }}>
                              {tag}
                            </span>
                          ))}
                          {q.tags.length > 3 && <span style={{color: 'var(--text-light)', fontSize: '0.7rem'}}>+{q.tags.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="cc-btn ghost sm"
                      onClick={() => {
                        setEditIdx(idx);
                        setShowQForm(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="cc-btn danger sm"
                      onClick={() => {
                        set("questions", form.questions.filter((_, i) => i !== idx));
                        showNotification(`Problem "${q.title}" removed`, 'error');
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showQForm && (
            <QuestionForm
              initialData={editIdx !== null ? form.questions[editIdx] : null}
              onCancel={() => {
                setShowQForm(false);
                setEditIdx(null);
              }}
              onSave={(q) => {
                if (editIdx !== null) {
                  const copy = [...form.questions];
                  copy[editIdx] = q;
                  set("questions", copy);
                  showNotification(`Problem "${q.title}" updated successfully!`);
                } else {
                  set("questions", [...form.questions, q]);
                  showNotification(`Problem "${q.title}" added successfully!`);
                }
                setShowQForm(false);
                setEditIdx(null);
              }}
            />
          )}

          <div className="cc-footer">
            <button className="cc-btn ghost" onClick={() => setStep(1)}>
              ← Back to Details
            </button>
            <button
              className="cc-btn primary"
              disabled={form.questions.length === 0}
              onClick={() => {
                if (form.questions.length > 0) {
                  setStep(3);
                  showNotification("Ready for review! Check all details before publishing.");
                }
              }}
            >
              Review Contest →
            </button>
          </div>
        </>
      )}

      {/* STEP 3 – REVIEW */}
      {step === 3 && (
        <div className="cc-card">
          <h2>Review & Publish</h2>

          <div className="cc-summary">
            <p><b>Contest Name:</b> <span>{form.name}</span></p>
            <p><b>Description:</b> <span>{form.description}</span></p>
            <p><b>Visibility:</b> <span>
              {form.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
            </span></p>
            <p><b>Schedule:</b> <span>
              {formatDateTime(form.start)} → {formatDateTime(form.end)}
            </span></p>
            <p><b>Duration:</b> <span>
              {Math.round((new Date(form.end) - new Date(form.start)) / (1000 * 60 * 60))} hours
            </span></p>
            <p><b>Languages:</b> <span>
              {form.allowedLanguages.map(lang => 
                languages.find(l => l.id === lang)?.icon + ' ' + 
                languages.find(l => l.id === lang)?.name
              ).join(', ')}
            </span></p>
            <p><b>Max Submissions:</b> <span>{form.maxSubmissions} per problem</span></p>
            <p><b>Penalty:</b> <span>{form.penalty} minutes for wrong answers</span></p>
            <p><b>Registration:</b> <span>
              {form.registrationRequired ? 
                `📝 Required (deadline: ${formatDateTime(form.registrationDeadline)})` : 
                '🚀 Open participation'
              }
            </span></p>
            <p><b>Leaderboard:</b> <span>
              {form.showLeaderboard ? '🏆 Live leaderboard enabled' : '🔒 Hidden leaderboard'}
            </span></p>
            {form.prize && (
              <p><b>Prizes:</b> <span>{form.prize}</span></p>
            )}
          </div>

          <div style={{display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', margin: '2rem 0'}}>
            <div style={{background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)'}}>
              <h4 style={{margin: '0 0 1rem 0', color: 'var(--text-secondary)'}}>
                📊 Contest Statistics
              </h4>
              <p>Problems: <strong>{form.questions.length}</strong></p>
              <p>Total Points: <strong>{getTotalPoints()}</strong></p>
              <p>Avg. Points/Problem: <strong>
                {form.questions.length ? Math.round(getTotalPoints() / form.questions.length) : 0}
              </strong></p>
              <div style={{marginTop: '1rem'}}>
                <p style={{margin: '0.25rem 0'}}>
                  🟢 Easy: {getDifficultyStats().easy || 0}
                </p>
                <p style={{margin: '0.25rem 0'}}>
                  🟡 Medium: {getDifficultyStats().medium || 0}
                </p>
                <p style={{margin: '0.25rem 0'}}>
                  🔴 Hard: {getDifficultyStats().hard || 0}
                </p>
              </div>
            </div>

            <div style={{background: 'var(--bg-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)'}}>
              <h4 style={{margin: '0 0 1rem 0', color: 'var(--text-secondary)'}}>
                ⚡ Quick Actions
              </h4>
              <button 
                className="cc-btn ghost sm" 
                style={{marginBottom: '0.5rem', width: '100%'}}
                onClick={() => setStep(1)}
              >
                📝 Edit Details
              </button>
              <button 
                className="cc-btn ghost sm" 
                style={{marginBottom: '0.5rem', width: '100%'}}
                onClick={() => setStep(2)}
              >
                🧩 Manage Problems
              </button>
              <button 
                className="cc-btn secondary sm" 
                style={{width: '100%'}}
                onClick={() => {
                  const contestData = JSON.stringify(form, null, 2);
                  const blob = new Blob([contestData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${form.name.replace(/\s+/g, '_')}_contest.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showNotification("Contest data exported successfully!");
                }}
              >
                💾 Export Contest
              </button>
            </div>
          </div>

          <h4 style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
            🧩 Problems ({form.questions.length})
          </h4>
          <ul className="cc-list">
            {form.questions.map((q, i) => (
              <li key={i}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <strong>{q.title}</strong>
                    <span className={`difficulty ${q.difficulty}`} style={{
                      marginLeft: '0.5rem', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '0.8rem', 
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {q.difficulty?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{color: 'var(--text-light)', fontSize: '0.85rem'}}>
                    🏆 {q.points} pts • 🏷️ {q.category}
                  </div>
                </div>
                {q.tags && q.tags.length > 0 && (
                  <div style={{marginTop: '0.5rem', fontSize: '0.75rem'}}>
                    Tags: {q.tags.join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {form.rules && (
            <div style={{margin: '2rem 0'}}>
              <h4 style={{color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>
                📋 Contest Rules
              </h4>
              <div style={{
                background: 'var(--bg-light)', 
                padding: '1rem', 
                borderRadius: 'var(--border-radius-md)',
                whiteSpace: 'pre-line',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                {form.rules}
              </div>
            </div>
          )}

          <div className="cc-footer">
            <button className="cc-btn ghost" onClick={() => setStep(2)}>
              ← Back to Questions
            </button>
            <button
              className="cc-btn success"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  // Simulate API call
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  onSubmit?.(form);
                  showNotification("🎉 Contest published successfully! Participants can now join.", 'success');
                  
                  // Reset form for new contest
                  setTimeout(() => {
                    setForm({
                      name: "",
                      description: "",
                      visibility: "public",
                      password: "",
                      start: "",
                      end: "",
                      allowedLanguages: ["python", "javascript", "java", "cpp"],
                      maxSubmissions: 50,
                      penalty: 20,
                      showLeaderboard: true,
                      registrationRequired: false,
                      registrationDeadline: "",
                      prize: "",
                      rules: "",
                      questions: [],
                    });
                    setStep(1);
                  }, 3000);
                } catch (error) {
                  showNotification("Failed to publish contest. Please try again.", 'error');
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? (
                <span className="cc-loading">
                  <span className="cc-spinner"></span>
                  Publishing...
                </span>
              ) : (
                "🚀 Publish Contest"
              )}
            </button>
          </div>
        </div>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={hideNotification}
      />
    </section>
  );
}