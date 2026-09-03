import React from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Password reset requested");

    // Backend password reset logic will be connected here later.
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">

        {/* Brand */}
        <div className="brand-section">
          <div className="brand-text">
            <h1>AI Academic Project Mentor</h1>
            <p>Progress Tracking &amp; Mentorship Platform</p>
          </div>
        </div>

        {/* Heading */}
        <div className="heading-section">
          <h2>Forgot Password?</h2>
          <p>
            Enter your email address and we'll send you a link
            to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <div className="input-wrapper">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <polyline points="3,7 12,13 21,7" />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="reset-password-btn"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to Login */}
        <div className="back-login-section">
          <span>Remember your password?</span>

          <button
            type="button"
            className="back-login-link"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;