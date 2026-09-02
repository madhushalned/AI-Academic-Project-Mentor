import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SkillAssessment from "./pages/SkillAssessment.jsx";
import MilestoneManagement from "./pages/MilestoneManagement.jsx";
import TimelineManagement from "./pages/TimelineManagement.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import "./App.css";

const pageMeta = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your academic project progress" },
  "skill-assessment": { title: "Skill Assessment", subtitle: "Evaluate and track your technical proficiencies" },
  milestones: { title: "Milestone Management", subtitle: "Plan, track, and update project milestones" },
  timeline: { title: "Timeline Management", subtitle: "Week-by-week project schedule and progress" },
  project: { title: "Project", subtitle: "Project details and configuration" },
  progress: { title: "Progress", subtitle: "Detailed progress analytics" },
  mentor: { title: "AI Mentor", subtitle: "AI-powered guidance and feedback" },
  reports: { title: "Reports", subtitle: "Generate and export project reports" },
  settings: { title: "Settings", subtitle: "Manage your account and preferences" },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const meta = pageMeta[currentPage] || { title: "AcadTracker", subtitle: "" };

  const handleNavigate = (page) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "skill-assessment":
        return <SkillAssessment />;
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
