import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import "./styles/integrated-pages.css";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/Forgotpassword";
import Dashboard from "./pages/dashboard";
import FacultyDashboard from "./pages/FacultyDashboard/FacultyDashboard";
import Profile from "./pages/Profile";
import SkillAssessment from "./pages/SkillAssessment";
import StudentProfile from "./pages/StudentProfile";
import MilestoneManagement from "./pages/MilestoneManagement";
import ProgressTracking from "./pages/ProgressTracking";
import TimelineManagement from "./pages/TimelineManagement";
import Documents from "./pages/Documents";
import WeeklyMentor from "./pages/WeeklyMentor/WeeklyMentor";
import IntegratedLayout from "./components/IntegratedLayout";

function FacultyRoute({ children }) {
  const token =
    localStorage.getItem("faculty_token") ||
    localStorage.getItem("facultyToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function StudentRoute({ children }) {
  const student = localStorage.getItem("student");

  if (!student) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Faculty Protected Portal */}
        <Route
          path="/faculty-dashboard"
          element={
            <FacultyRoute>
              <FacultyDashboard />
            </FacultyRoute>
          }
        />

        {/* Student Protected Portal */}
        <Route
          path="/dashboard"
          element={
            <StudentRoute>
              <Dashboard />
            </StudentRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <StudentRoute>
              <Profile />
            </StudentRoute>
          }
        />

        <Route
          path="/student-profile"
          element={
            <StudentRoute>
              <IntegratedLayout>
                <StudentProfile />
              </IntegratedLayout>
            </StudentRoute>
          }
        />

        <Route
          path="/skill-assessment"
          element={
            <StudentRoute>
              <IntegratedLayout>
                <SkillAssessment />
              </IntegratedLayout>
            </StudentRoute>
          }
        />

        <Route
          path="/milestones"
          element={
            <StudentRoute>
              <IntegratedLayout>
                <MilestoneManagement />
              </IntegratedLayout>
            </StudentRoute>
          }
        />

        <Route
          path="/progress-tracking"
          element={
            <StudentRoute>
              <IntegratedLayout>
                <ProgressTracking />
              </IntegratedLayout>
            </StudentRoute>
          }
        />

        <Route
          path="/timeline"
          element={
            <StudentRoute>
              <IntegratedLayout>
                <ProgressTracking />
              </IntegratedLayout>
            </StudentRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <StudentRoute>
              <Documents />
            </StudentRoute>
          }
        />

        <Route
          path="/weekly-mentor"
          element={
            <StudentRoute>
              <WeeklyMentor />
            </StudentRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;