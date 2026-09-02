import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "./Signup.css";
const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = (data) => {
    console.log("Signup Data:", data);

    // Example:
    // Send data to your backend here
    //
    // fetch("http://localhost:5000/api/signup", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // });
  };

  return (
    <div className="signup-page">
      {/* Decorative background elements */}
      <div className="background-circle circle-top"></div>
      <div className="background-circle circle-bottom"></div>

      <div className="dot-pattern dots-top"></div>
      <div className="dot-pattern dots-bottom"></div>

      {/* Signup Card */}
      <div className="signup-card">

        {/* Header */}
        <div className="brand-section">
          

          <div className="brand-text">
            <h1>AI Academic Project Mentor</h1>
            <p>Progress Tracking &amp; Mentorship Platform</p>
          </div>
        </div>

        {/* Page Heading */}
        <div className="heading-section">
          <h2>Create your account</h2>
          <p>Get started with your academic project journey.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>

            <div
              className={`input-wrapper ${
                errors.fullName ? "input-error" : ""
              }`}
            >
              <span className="input-icon">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                </svg>
              </span>

              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
            </div>

            {errors.fullName && (
              <p className="error-message">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <div
              className={`input-wrapper ${
                errors.email ? "input-error" : ""
              }`}
            >
              <span className="input-icon">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </div>

            {errors.email && (
              <p className="error-message">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div
              className={`input-wrapper ${
                errors.password ? "input-error" : ""
              }`}
            >
              <span className="input-icon">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message:
                      "Password must be at least 8 characters",
                  },
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 4 10 8-0.4 1.5-1.3 2.8-2.4 3.9" />
                    <path d="M6.1 6.1C4.5 7.3 3.4 9 2 12c1 4 5 8 10 8 1.4 0 2.7-.3 3.9-.8" />
                  </svg>
                ) : (
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <p className="error-message">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div
              className={`input-wrapper ${
                errors.confirmPassword ? "input-error" : ""
              }`}
            >
              <span className="input-icon">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password ||
                    "Passwords do not match",
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 4 10 8-0.4 1.5-1.3 2.8-2.4 3.9" />
                    <path d="M6.1 6.1C4.5 7.3 3.4 9 2 12c1 4 5 8 10 8 1.4 0 2.7-.3 3.9-.8" />
                  </svg>
                ) : (
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="error-message">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="create-account-btn">
            Create Account
          </button>
        </form>

        {/* OR Divider */}
        <div className="divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        {/* Login */}
        <div className="login-section">
          <span>Already have an account?</span>

          <button
            type="button"
            className="login-link"
              onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;