import React, { useState, useEffect, useRef } from "react";
import { Menu, X, User, Bell } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ additionalLinks = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // ✅ Fetch user info if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    setIsLoggedIn(!!token);

    // ✅ Handle Admin separately (no JWT fetch)
    if (storedRole === "admin") {
      setUserName(storedName || "Admin");
      setRole("admin");
      return;
    }

    // ✅ For other users — fetch their info using JWT
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setUserName(data.user.fullName);
          setRole(data.user.role);
        })
        .catch(() => {
          setIsLoggedIn(false);
          setUserName("");
          setRole("");
        });
    } else {
      setUserName("");
      setRole("");
    }
  }, []);


  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handlers
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLoginClick = () => navigate("/login");
  const handleUserIconClick = () => setDropdownOpen((prev) => !prev);

  const handleNotificationClick = () => {
    if (role === 'admin') navigate('/admin');
    else navigate('/notifications');
  };

  const handleLogout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    setIsLoggedIn(false);
    setUserName("");
    setRole("");
    navigate("/");
  };

  // ✅ Check active path
  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className={`navbar-container ${isLoggedIn ? "logged-in" : ""}`}>
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="logo">
            <div className="logo-circle"></div>
            <span className="brand-text">EventSphere</span>
          </div>
        </div>

        {/* Links */}
        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <Link
            to={isLoggedIn ? "/home" : "/"}
            className={`navbar-item ${isActive("/home") || isActive("/")}`}
          >
            Home
          </Link>

          {role === "organizer" && (
            <Link
              to="/organizer-dashboard"
              className={`navbar-item ${isActive("/organizer-dashboard")}`}
            >
              Dashboard
            </Link>
          )}

          <a href="#events" className="navbar-item">
            Events
          </a>

          {role === "organizer" && (
            <Link to="/" className={`navbar-item ${isActive("/")}`}>
              My Events
            </Link>
          )}

          <a href="#contact" className="navbar-item">
            Contact
          </a>

          {role === "admin" && (
            <>
              <Link
                to="/admin-dashboard"
                className={`navbar-item ${isActive("/admin-dashboard")}`}
              >
                Dashboard
              </Link>
              <div className="notification-icon" onClick={handleNotificationClick}>
                <Bell size={24} />
                {pendingCount > 0 && (
                  <span className="notification-badge">{pendingCount}</span>
                )}
              </div>
            </>
          )}

          {role === "attendee" && (
            <Link
              to="/attendee-dashboard"
              className={`navbar-item ${isActive("/attendee-dashboard")}`}
            >
              Dashboard
            </Link>
          )}

          {role === "attendee" && (
            <Link
              to="/ticketpage"
              className={`navbar-item ${isActive("/ticketpage")}`}
            >
              My Bookings
            </Link>
          )}

          {additionalLinks.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              className={`navbar-item ${isActive(link.to)}`}
            >
              {link.text}
            </Link>
          ))}
        </div>

        {/* Auth / User */}
        <div className="navbar-auth">
          {!isLoggedIn ? (
            <button className="signup-btn" onClick={handleLoginClick}>
              Login
            </button>
          ) : (
            <>
              <button
                ref={buttonRef}
                className="user-icon-btn"
                onClick={handleUserIconClick}
                aria-label="User menu"
              >
                <div className="user-icon-box">
                  <User size={24} color="#8B5CF6" />
                </div>
              </button>

              {dropdownOpen && (
                <div ref={dropdownRef} className="user-dropdown">
                  <div className="user-info">
                    {userName}
                    <br />
                    <span className="role-badge">{role}</span>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
