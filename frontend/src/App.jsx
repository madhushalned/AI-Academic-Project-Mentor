import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/Forgotpassword";
import Dashboard from "./pages/dashboard";
import Documents from "./pages/Documents";
import WeeklyMentor from "./pages/WeeklyMentor/WeeklyMentor";
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
        <Route path="/documents"element={<Documents />}/>
        <Route path="/weekly-mentor" element={<WeeklyMentor />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;