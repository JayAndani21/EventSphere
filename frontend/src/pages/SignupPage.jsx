import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // 🔹 Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        break;

      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        break;

      case 'password':
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          return 'Password must include uppercase, lowercase, and a number';
        break;

      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        break;

      default:
        return '';
    }
    return '';
  };

  // 🔹 Handle input change with live validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const errorMsg = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  // 🔹 Validate all fields on submit
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    if (!formData.role) {
      newErrors.role = 'Please select a role (Organizer or Attendee)';
    }
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms & Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Signup successful! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover theme="colored" />

      <div className="signup-content">
        {/* Left Panel */}
        <div className="signup-left">
          <div className="hero-text">
            <h1>Your Gateway to Unforgettable Events</h1>
            <p>Connect, create, and experience unforgettable moments.<br />EventSphere brings people together.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="signup-right">
          <div className="signup-form-container">
            <h2>Create Your EventSphere Account</h2>

            <form onSubmit={handleSubmit} className="signup-form">

              {/* Full Name */}
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
                    className={errors.fullName ? 'error' : ''}
                  />
                </div>
                {errors.fullName && <p className="error-text">{errors.fullName}</p>}
              </div>

              {/* Email */}
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
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              {/* Password */}
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
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container password-input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>

              {/* Role Selection */}
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
                {errors.role && <p className="error-text">{errors.role}</p>}
              </div>

              {/* Terms */}
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p className="error-text">{errors.terms}</p>}

              <button type="submit" className="signup-btn" disabled={!agreeToTerms}>
                Sign Up
              </button>

              <div className="login-link">
                Already have an account? <a href="/login">Login</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
