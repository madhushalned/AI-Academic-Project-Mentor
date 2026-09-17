import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SkillAssessment from "./pages/SkillAssessment.jsx";
import MilestoneManagement from "./pages/MilestoneManagement.jsx";
import TimelineManagement from "./pages/TimelineManagement.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";

import Login from "./pages/login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

import "./App.css";

const pageMeta = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of your academic project progress",
  },
  "skill-assessment": {
    title: "Skill Assessment",
    subtitle: "Evaluate and track your technical proficiencies",
  },
  "student-profile": {
    title: "Student Profile",
    subtitle: "View and manage your student information",
  },
  milestones: {
    title: "Milestone Management",
    subtitle: "Plan, track, and update project milestones",
  },
  timeline: {
    title: "Timeline Management",
    subtitle: "Week-by-week project schedule and progress",
  },
  project: {
    title: "Project",
    subtitle: "Project details and configuration",
  },
  progress: {
    title: "Progress",
    subtitle: "Detailed progress analytics",
  },
  mentor: {
    title: "AI Mentor",
    subtitle: "AI-powered guidance and feedback",
  },
  reports: {
    title: "Reports",
    subtitle: "Generate and export project reports",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your account and preferences",
  },
};

function DashboardApp() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const meta =
    pageMeta[currentPage] || {
      title: "AcadTracker",
      subtitle: "",
    };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;

      case "skill-assessment":
        return <SkillAssessment />;

      case "student-profile":
        return <StudentProfile />;

      case "milestones":
        return <MilestoneManagement />;

      case "timeline":
        return <TimelineManagement onNavigate={handleNavigate} />;

      case "project":
      case "progress":
      case "mentor":
      case "reports":
      case "settings":
        return <PlaceholderPage title={meta.title} />;

      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      {renderPage()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication pages */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Application pages */}
        <Route path="/dashboard" element={<DashboardApp />} />
        <Route path="/student-profile" element={<DashboardApp />} />
        <Route path="/skill-assessment" element={<DashboardApp />} />
        <Route path="/milestones" element={<DashboardApp />} />
        <Route path="/timeline" element={<DashboardApp />} />
        <Route path="/project" element={<DashboardApp />} />
        <Route path="/progress" element={<DashboardApp />} />
        <Route path="/mentor" element={<DashboardApp />} />
        <Route path="/reports" element={<DashboardApp />} />
        <Route path="/settings" element={<DashboardApp />} />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}