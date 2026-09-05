import React, { useState } from "react";

const IdeaSubmission = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    if (!domain.trim()) {
      setError("Project domain is required.");
      return;
    }

    if (!description.trim()) {
      setError("Project description is required.");
      return;
    }

    setError("");

    // Send the complete project object to Dashboard
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      domain: domain.trim()
    });

    // Clear form
    setTitle("");
    setDomain("");
    setDescription("");

    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <h2 style={styles.title}>
          Submit Project Idea
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Project Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Project Title
            </label>

            <input
              type="text"
              placeholder="Enter your project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Domain */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Domain
            </label>

            <input
              type="text"
              placeholder="e.g. Artificial Intelligence"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Project Description
            </label>

            <textarea
              rows="5"
              placeholder="Describe your project idea in 2-3 lines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          {/* Buttons */}
          <div style={styles.actions}>

            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.submitBtn}
            >
              Submit Idea
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },

  modal: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
  },

  title: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a"
  },

  formGroup: {
    marginBottom: "16px"
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical"
  },

  error: {
    color: "#dc2626",
    fontSize: "13px",
    margin: "0 0 12px 0"
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px"
  },

  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#475569"
  },

  submitBtn: {
    padding: "8px 16px",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500"
  }
};

export default IdeaSubmission;
