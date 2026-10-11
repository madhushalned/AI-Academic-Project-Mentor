import React from "react";

const FacultyHeader = () => {
  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <span style={styles.title}>Faculty Portal</span>
      </div>

      <div style={styles.profileSection}>
        <div style={styles.profileCircle}></div>

        <div>
          <span style={styles.role}>Faculty</span>
          <span style={styles.profileText}>Faculty Member</span>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: "64px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    boxSizing: "border-box",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
  },

  title: {
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  profileCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
  },

  role: {
    display: "block",
    color: "#6b7280",
    fontSize: "11px",
  },

  profileText: {
    display: "block",
    color: "#1f2937",
    fontSize: "13px",
    fontWeight: "600",
  },
};

export default FacultyHeader;