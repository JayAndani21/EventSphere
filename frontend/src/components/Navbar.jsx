import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    navigate('/login'); // Redirect to Login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo">
            <div className="logo-circle"></div>
            <span className="brand-text">EventSphere</span>
          </div>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-item active">Home</Link>
          {/* <a href="#home" className="navbar-item active">Home</a> */}
          <a href="#features" className="navbar-item">Features</a>
          <a href="#events" className="navbar-item">Events</a>
          <a href="#contact" className="navbar-item">Contact</a>
        </div>

        <div className="navbar-auth">
          <button className="signup-btn" onClick={handleLoginClick}>Login</button>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
