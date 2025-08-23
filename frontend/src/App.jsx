import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage';
import AttendeeDashboard from './pages/AttendeeDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Navbar from './components/Navbar';


// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  return token ? children : null;
};

// HomeRedirect component for handling home navigation when logged in
const HomeRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  return <Navigate to={userRole === 'organizer' ? '/organizer-dashboard' : '/attendee-dashboard'} replace />;
};

// Layout component that includes Navbar
const Layout = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const additionalLinks = userRole === 'organizer' 
    ? [{ to: "/organize-event", text: "Organize Event" }]
    : userRole === 'attendee'
    ? [{ to: "/contests", text: "Contests" }]
    : [];

  return (
    <>
      <Navbar additionalLinks={additionalLinks} />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with Layout */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <LoginPage />
          </Layout>
        } />
        <Route path="/signup" element={
          <Layout>
            <SignupPage />
          </Layout>
        } />

        {/* Protected routes with Layout */}
        <Route path="/attendee-dashboard" element={
          <ProtectedRoute>
            <Layout>
              <AttendeeDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/organizer-dashboard" element={
          <ProtectedRoute>
            <Layout>
              <OrganizerDashboard />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Redirect route for home when logged in */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
