
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const endpoint =
        role === "faculty"
          ? "http://127.0.0.1:8000/faculty/login"
          : "http://127.0.0.1:8000/students/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const message =
          typeof result.detail === "string"
            ? result.detail
            : typeof result.message === "string"
            ? result.message
            : "Invalid email or password";

        alert(message);
        return;
      }

      if (role === "faculty") {
        if (!result.access_token || !result.faculty) {
          alert("Faculty login response is incomplete. Please try again.");
          return;
        }

        // Clear any previous student session.
        localStorage.removeItem("student");

        // Store faculty authentication and profile.
        localStorage.setItem("faculty_token", result.access_token);
        localStorage.setItem("facultyToken", result.access_token);
        localStorage.setItem(
          "faculty",
          JSON.stringify(result.faculty)
        );

        console.log("Faculty login successful");

        navigate("/faculty-dashboard", { replace: true });
      } else {
        if (!result.student) {
          alert("Student login response is incomplete. Please try again.");
          return;
        }

        // Clear any previous faculty session.
        localStorage.removeItem("faculty_token");
        localStorage.removeItem("facultyToken");
        localStorage.removeItem("faculty");

        // Preserve the existing student login behavior.
        localStorage.setItem(
          "student",
          JSON.stringify(result.student)
        );

        console.log("Student login successful");

        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative background elements */}
      <div className="background-circle circle-top"></div>
      <div className="background-circle circle-bottom"></div>

      <div className="dot-pattern dots-top"></div>
      <div className="dot-pattern dots-bottom"></div>

      {/* Login Card */}
      <div className="login-card">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-text">
            <h1>AI Academic Project Mentor</h1>
            <p>Progress Tracking &amp; Mentorship Platform</p>
          </div>
        </div>

        {/* Heading */}
        <div className="heading-section">
          <h2>Welcome back</h2>
          <p>Log in to continue your academic project journey.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selector */}
          <div className="form-group">
            <label htmlFor="login-role">Login as</label>

            <select
              id="login-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="role-select"
              aria-label="Select login role"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
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
                autoComplete="username"
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
            <div className="password-label-row">
              <label htmlFor="password">Password</label>

              <button
                type="button"
                className="forgot-password"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

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
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
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

          {/* Remember Me */}
          <div className="remember-section">
            <label className="remember-label">
              <input type="checkbox" {...register("rememberMe")} />
              <span>Remember me</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Logging in..."
              : role === "faculty"
              ? "Log In as Faculty"
              : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        {/* Signup */}
        <div className="signup-section">
          <span>Don't have an account?</span>

          <button
            type="button"
            className="signup-link"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
