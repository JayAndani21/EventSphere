import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempt:', formData);
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        {/* Left Panel */}
        <div className="signup-left">
          <div className="left-content">
            <div className="logo-section">
              <div className="main-logo">
                {/* <div className="main-logo-circle" />   */}
                {/* <span className="logo-text">EventSphere</span> */}
              </div>
            </div>

            <div className="hero-text">
              <h1>Your Gateway to Unforgettable Events</h1>
              <p>
                Connect, create, and experience unforgettable moments. <br />
                EventSphere brings people together.
              </p>
            </div>

            <div className="image-section">
              {/* <img src="/signup-image.png" alt="Events" className="left-image" /> */}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="signup-right">
          <div className="signup-form-container">
            <div className="signup-header">
              <h2>Create Your EventSphere Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-container">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-container">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container password-input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                  />
                  {/* <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button> */}
                </div>
              </div>

              <div className="form-group">
                <label>Role</label>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'organizer' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'organizer' }))}
                  >
                    Organizer
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${formData.role === 'attendee' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, role: 'attendee' }))}
                  >
                    Attendee
                  </button>
                </div>
              </div>

              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <label htmlFor="terms">
                  I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" className="signup-btn" disabled={!agreeToTerms}>
                Sign Up
              </button>

              <div className="login-link">
                Already have an account? <a href="#login">Login</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
