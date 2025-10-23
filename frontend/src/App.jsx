// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AttendeeDashboard from "./pages/AttendeeDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateContest from "./pages/CreateContest";
import CreateEvent from "./pages/CreateEvent";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import TicketPage from "./pages/TicketPage";  
import ContestRegistrationPage from "./pages/ContestRegistrationPage";
import MyContests from "./pages/MyContests";
import ProblemList from "./pages/ProblemList";
import Problem from "./pages/Problem";

/* ───────────────────────── Protected wrapper ───────────────────────── */
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

/* ───────────────────────── Navbar + outlet layout ──────────────────── */
const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

/* ────────────────────────────── App root ───────────────────────────── */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/contest/:id" element={<ContestRegistrationPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/attendee-dashboard" element={<AttendeeDashboard />} />
            <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/create-contest" element={<CreateContest />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/ticketpage" element={<TicketPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/my-contests" element={<MyContests />} />
            <Route path="/contest/:id/problems" element={<ProblemList />} />
            <Route path="/contest/:id/problem/:problemId" element={<Problem />} />
          </Route>
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
