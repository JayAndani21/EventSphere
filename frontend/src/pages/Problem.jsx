import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Play, Send, RotateCcw, Settings, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Code2 } from "lucide-react";
import "../styles/Problem.css";

const Problem = () => {
  const { id, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [expandedHints, setExpandedHints] = useState([]);
  const [testResultTab, setTestResultTab] = useState("testcase");

  const languageOptions = [
    { value: "cpp", label: "C++", template: "class Solution {\npublic:\n    int missingMultiple(vector<int>& nums, int k) {\n        // Write your code here\n    }\n};" },
    { value: "python", label: "Python", template: "class Solution:\n    def missingMultiple(self, nums: List[int], k: int) -> int:\n        # Write your code here\n        pass" },
    { value: "javascript", label: "JavaScript", template: "/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar missingMultiple = function(nums, k) {\n    // Write your code here\n};" },
    { value: "java", label: "Java", template: "class Solution {\n    public int missingMultiple(int[] nums, int k) {\n        // Write your code here\n    }\n}" },
  ];

  const themeOptions = [
    { value: "vs-dark", label: "Dark" },
    { value: "vs-light", label: "Light" },
    { value: "hc-black", label: "High Contrast" },
  ];

  const difficultyColors = {
    easy: "#10b981",
    medium: "#f59e0b",
    hard: "#ef4444"
  };

  useEffect(() => {
    fetchProblem();
  }, [id, problemId]);

  useEffect(() => {
    if (problem) {
      const template = problem.solutions?.[language] || languageOptions.find(l => l.value === language)?.template || "";
      setCode(template);
    }
  }, [language, problem]);

  const fetchProblem = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/questions/single/${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setProblem(data.problem || data);
        const initialLang = "cpp";
        setLanguage(initialLang);
        setCode(data.solutions?.[initialLang] || languageOptions[0].template);
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

  const handleRun = async () => {
    setIsRunning(true);
    setTestResultTab("result");
    setTimeout(() => {
      setTestResults({
        passed: 1,
        total: problem?.sampleTestCases?.length || 1,
        cases: problem?.sampleTestCases?.map((tc, i) => ({
          id: i + 1,
          passed: i === 0,
          input: tc.input,
          expected: tc.output,
          actual: i === 0 ? tc.output : "Wrong Answer"
        }))
      });
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setTimeout(() => {
      alert("Solution submitted! (This is a demo)");
      setIsRunning(false);
    }, 1000);
  };

  const handleReset = () => {
    const template = problem.solutions?.[language] || languageOptions.find(l => l.value === language)?.template || "";
    setCode(template);
  };

  const toggleHint = (index) => {
    setExpandedHints(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="solution-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading problem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solution-page-error">
        <h3>Error Loading Problem</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="error-back-btn">Go Back</button>
      </div>
    );
  }

  return (
    <div className="solution-view-container">
      <div className="solution-view-split">
        {/* Left Panel - Problem Description */}
        <div className="solution-view-left">
          <div className="solution-nav-tabs">
            <button 
              className={`solution-nav-tab ${activeTab === "description" ? "solution-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button 
              className={`solution-nav-tab ${activeTab === "editorial" ? "solution-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("editorial")}
            >
              Editorial
            </button>
            <button 
              className={`solution-nav-tab ${activeTab === "solutions" ? "solution-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("solutions")}
            >
              Solutions
            </button>
            <button 
              className={`solution-nav-tab ${activeTab === "submissions" ? "solution-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </button>
          </div>

          <div className="solution-view-content">
            {activeTab === "description" && (
              <div className="solution-description-panel">
                <div className="solution-header-section">
                  <h1 className="solution-main-title">{problem?.title}</h1>
                  <div className="solution-badge-group">
                    <span 
                      className="solution-difficulty-tag"
                      style={{ 
                        backgroundColor: `${difficultyColors[problem?.difficulty]}20`,
                        color: difficultyColors[problem?.difficulty]
                      }}
                    >
                      {problem?.difficulty || "Medium"}
                    </span>
                  </div>
                </div>

                <div className="solution-main-description">
                  <p>{problem?.description}</p>
                </div>

                {problem?.sampleTestCases && problem.sampleTestCases.length > 0 && (
                  <div className="solution-examples-block">
                    <h3 className="solution-section-title">Examples</h3>
                    {problem.sampleTestCases.map((tc, idx) => (
                      <div key={idx} className="solution-example-card">
                        <div className="solution-example-heading">Example {idx + 1}</div>
                        <div className="solution-example-body">
                          <div className="solution-example-row">
                            <span className="solution-example-label">Input:</span>
                            <code className="solution-example-code">{tc.input}</code>
                          </div>
                          <div className="solution-example-row">
                            <span className="solution-example-label">Output:</span>
                            <code className="solution-example-code">{tc.output}</code>
                          </div>
                          {tc.explanation && (
                            <div className="solution-example-row">
                              <span className="solution-example-label">Explanation:</span>
                              <span className="solution-example-code">{tc.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {problem?.constraints && (
                  <div className="solution-constraints-block">
                    <h3 className="solution-section-title">Constraints</h3>
                    <ul>
                      {problem.constraints.split('\n').map((constraint, idx) => (
                        <li key={idx}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem?.hints && problem.hints.length > 0 && (
                  <div className="solution-hints-block">
                    <h3 className="solution-section-title">Hints</h3>
                    {problem.hints.map((hint, idx) => (
                      <div key={idx} className="solution-hint-wrapper">
                        <button 
                          className="solution-hint-button"
                          onClick={() => toggleHint(idx)}
                        >
                          {expandedHints.includes(idx) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>Hint {idx + 1}</span>
                        </button>
                        {expandedHints.includes(idx) && (
                          <div className="solution-hint-text">
                            <p>{hint}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "editorial" && (
              <div className="solution-editorial-panel">
                <h2>Editorial</h2>
                <div className="solution-editorial-body">
                  {problem?.editorial ? (
                    <p>{problem.editorial}</p>
                  ) : (
                    <p className="solution-empty-text">Editorial not available yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "solutions" && (
              <div className="solution-community-panel">
                <h2>Solutions</h2>
                <p className="solution-empty-text">Community solutions will appear here.</p>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="solution-history-panel">
                <h2>Submissions</h2>
                <p className="solution-empty-text">Your submission history will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="solution-view-right">
          <div className="code-editor-toolbar">
            <div className="code-editor-toolbar-left">
              <Code2 size={18} className="code-editor-icon" />
              <select 
                className="code-language-dropdown"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languageOptions.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="code-editor-actions">
              <div className="code-theme-picker">
                <button 
                  className="code-theme-button"
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  title="Change Theme"
                >
                  <Settings size={16} />
                </button>
                {showThemeMenu && (
                  <div className="code-theme-dropdown">
                    {themeOptions.map(theme => (
                      <button
                        key={theme.value}
                        className={`code-theme-choice ${editorTheme === theme.value ? 'code-theme-active' : ''}`}
                        onClick={() => {
                          setEditorTheme(theme.value);
                          setShowThemeMenu(false);
                        }}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="code-reset-button" onClick={handleReset} title="Reset Code">
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="code-editor-wrapper">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
              }}
            />
          </div>

          <div className="code-test-section">
            <div className="code-test-tabs">
              <button 
                className={`code-test-tab ${testResultTab === "testcase" ? "code-test-tab-active" : ""}`}
                onClick={() => setTestResultTab("testcase")}
              >
                Testcase
              </button>
              <button 
                className={`code-test-tab ${testResultTab === "result" ? "code-test-tab-active" : ""}`}
                onClick={() => setTestResultTab("result")}
              >
                Test Result
                {testResults && (
                  <span className="code-result-indicator">
                    {testResults.passed}/{testResults.total}
                  </span>
                )}
              </button>
            </div>

            {testResultTab === "testcase" && (
              <>
                <div className="code-case-selector">
                  {problem?.sampleTestCases?.map((tc, idx) => (
                    <button
                      key={idx}
                      className={`code-case-button ${selectedTestCase === idx ? 'code-case-active' : ''}`}
                      onClick={() => setSelectedTestCase(idx)}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="code-case-display">
                  {problem?.sampleTestCases?.[selectedTestCase] && (
                    <>
                      <div className="code-input-block">
                        <div className="code-io-label">Input</div>
                        <div className="code-io-value">
                          {problem.sampleTestCases[selectedTestCase].input}
                        </div>
                      </div>
                      <div className="code-output-block">
                        <div className="code-io-label">Expected Output</div>
                        <div className="code-io-value">
                          {problem.sampleTestCases[selectedTestCase].output}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {testResultTab === "result" && (
              <div className="code-results-view">
                {testResults ? (
                  <>
                    <div className="code-summary-wrapper">
                      <div className={`code-summary-box ${testResults.passed === testResults.total ? 'code-summary-success' : 'code-summary-fail'}`}>
                        {testResults.passed === testResults.total ? (
                          <>
                            <CheckCircle size={24} />
                            <div>
                              <div className="code-summary-main">All Tests Passed!</div>
                              <div className="code-summary-sub">{testResults.passed}/{testResults.total} test cases</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle size={24} />
                            <div>
                              <div className="code-summary-main">Some Tests Failed</div>
                              <div className="code-summary-sub">{testResults.passed}/{testResults.total} test cases passed</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="code-cases-grid">
                      {testResults.cases?.map((testCase, idx) => (
                        <div key={idx} className={`code-case-box ${testCase.passed ? 'code-case-pass' : 'code-case-fail'}`}>
                          <div className="code-case-top">
                            <div className="code-case-name">
                              {testCase.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              <span>Test Case {testCase.id}</span>
                            </div>
                            <span className={`code-status-pill ${testCase.passed ? 'code-status-pass' : 'code-status-fail'}`}>
                              {testCase.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="code-case-info">
                            <div className="code-info-line">
                              <span className="code-info-key">Input:</span>
                              <code>{testCase.input}</code>
                            </div>
                            <div className="code-info-line">
                              <span className="code-info-key">Expected:</span>
                              <code>{testCase.expected}</code>
                            </div>
                            <div className="code-info-line">
                              <span className="code-info-key">Output:</span>
                              <code className={testCase.passed ? 'code-output-correct' : 'code-output-wrong'}>{testCase.actual}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="code-no-results">
                    <Clock size={48} />
                    <p>Run your code to see test results</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="code-action-bar">
            <div className="code-submit-actions">
              <button 
                className="code-run-button" 
                onClick={handleRun}
                disabled={isRunning}
              >
                <Play size={16} />
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <button 
                className="code-submit-button" 
                onClick={handleSubmit}
                disabled={isRunning}
              >
                <Send size={16} />
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem;