import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/integrated-pages.css";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/dashboard";
import MilestoneManagement from "./pages/MilestoneManagement";
import TimelineManagement from "./pages/TimelineManagement";
import SkillAssessment from "./pages/SkillAssessment";
import StudentProfile from "./pages/StudentProfile";

import IntegratedLayout from "./components/IntegratedLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Login />} />
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Signup */}
        <Route path="/signup" element={<Signup />} />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
              <Route
        path="/milestones"
        element={
          <IntegratedLayout>
            <MilestoneManagement />
          </IntegratedLayout>
        }
      />

      <Route
        path="/timeline"
        element={
          <IntegratedLayout>
            <TimelineManagement />
          </IntegratedLayout>
        }
      />

      <Route
        path="/skill-assessment"
        element={
          <IntegratedLayout>
            <SkillAssessment />
          </IntegratedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <IntegratedLayout>
            <StudentProfile />
          </IntegratedLayout>
        }
      />

      </Routes>
    </BrowserRouter>
  );
}

export default App;



