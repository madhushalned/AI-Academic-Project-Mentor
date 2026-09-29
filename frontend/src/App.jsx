import React from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import "./styles/integrated-pages.css";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/dashboard";

import MilestoneManagement from "./pages/MilestoneManagement";
import TimelineManagement from "./pages/TimelineManagement";
import Documents from "./pages/Documents";

import IntegratedLayout from "./components/IntegratedLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Milestone Management */}
        <Route
          path="/milestones"
          element={
            <IntegratedLayout>
              <MilestoneManagement />
            </IntegratedLayout>
          }
        />

        {/* Timeline Management */}
        <Route
          path="/timeline"
          element={
            <IntegratedLayout>
              <TimelineManagement />
            </IntegratedLayout>
          }
        />

        {/* Documents */}
        <Route
          path="/documents"
          element={<Documents />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;