import React, { useState } from 'react';
import { Eye, EyeOff, User, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/LoginPage.css';
import ParticlesBackground from '../components/ParticlesBackground';
 // particles


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('attendee');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, userType });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
        <ParticlesBackground />
      {/* Left Side - Conference Image */}
      <div className="login-left">
        <div className="login-overlay">
          {/* <div className="logo-section"> */}
            {/* <div className="logo">
              <div className="logo-circle"></div>
              <span className="brand-text">EventSphere</span>
            </div> */}
          {/* </div> */}
          
          <div className="testimonial">
            <h2>Your gateway to seamless event experiences.</h2>
            {/* <p>
              "EventSphere transformed how we manage our conferences. The intuitive interface and powerful features 
              made our last event a huge success!"
            </p> */}
            {/* <div className="testimonial-author">
              — Sarah Chen, Lead Organizer at TechConnect
            </div> */}
          </div>
          
          {/* <div className="copyright">
            © 2023 EventSphere. All rights reserved.
          </div> */}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h1>Login to EventSphere</h1>
            <p>Your gateway to seamless event experiences.</p>
          </div>

          {/* User Type Toggle */}
          <div className="user-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${userType === 'attendee' ? 'active' : ''}`}
              onClick={() => setUserType('attendee')}
            >
              <User size={16} />
              Attendee
            </button>
            <button
              type="button"
              className={`toggle-btn ${userType === 'organizer' ? 'active' : ''}`}
              onClick={() => setUserType('organizer')}
            >
              <Building size={16} />
              Organizer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <a href="#forgot" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup" className="navbar-item">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;