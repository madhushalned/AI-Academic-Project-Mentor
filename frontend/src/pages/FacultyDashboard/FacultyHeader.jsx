import React from "react";
import { useNavigate } from "react-router-dom";

const FacultyHeader = () => {
  const navigate = useNavigate();

  let faculty = null;
  try {
    faculty = JSON.parse(localStorage.getItem("faculty") || "null");
  } catch (e) {
    faculty = null;
  }

  const facultyName = faculty?.name || "Faculty Member";
  const facultyEmail = faculty?.email || "faculty@portal";
  const facultyInitials = facultyName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "FA";

  const handleLogout = () => {
    localStorage.removeItem("faculty_token");
    localStorage.removeItem("facultyToken");
    localStorage.removeItem("faculty");
    navigate("/login", { replace: true });
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <div style={styles.logoMark}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <span style={styles.title}>Faculty Supervision Portal</span>
          <span style={styles.subtitle}>Academic Project Mentorship & Progress Oversight</span>
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.profileSection}>
          <div style={styles.profileCircle} aria-hidden="true">
            {facultyInitials}
          </div>

          <div style={styles.infoText}>
            <span style={styles.profileText}>{facultyName}</span>
            <span style={styles.role}>{facultyEmail}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutBtn}
          title="Log out of faculty portal"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: "70px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logoMark: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    display: "block",
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "-0.01em",
  },

  subtitle: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  profileCircle: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    border: "1.5px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.5px",
  },

  infoText: {
    display: "flex",
    flexDirection: "column",
  },

  profileText: {
    display: "block",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "600",
  },

  role: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
  },

  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};

export default FacultyHeader;