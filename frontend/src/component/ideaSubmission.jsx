import React, { useState } from "react";

const IdeaSubmission = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle("");
    setDomain("");
    setDescription("");
    setProblemStatement("");
    setExpectedOutcome("");
    setError("");
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

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

    if (!problemStatement.trim()) {
      setError("Problem statement is required.");
      return;
    }

    if (!expectedOutcome.trim()) {
      setError("Expected outcome is required.");
      return;
    }

    setError("");

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      domain: domain.trim(),
      problemStatement: problemStatement.trim(),
      expectedOutcome: expectedOutcome.trim(),
    });

    resetForm();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Submit Project Idea</h2>
            <p style={styles.subtitle}>
              Provide details about your project so the AI mentor can analyze and guide you.
            </p>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Project Title</label>
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
            <label style={styles.label}>Domain</label>
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
            <label style={styles.label}>Project Description</label>
            <textarea
              rows="4"
              placeholder="Describe your project idea in 2-3 lines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* Problem Statement */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Problem Statement</label>
            <textarea
              rows="3"
              placeholder="What problem does your project aim to solve?"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* Expected Outcome */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Expected Outcome</label>
            <textarea
              rows="3"
              placeholder="What do you expect your project to achieve?"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* Error Display */}
          {error && <p style={styles.error}>{error}</p>}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleModalClose}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
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
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    margin: "7px 0 0",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#64748b",
  },
  closeButton: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "22px",
    lineHeight: "1",
    cursor: "pointer",
  },
  formGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#0f172a",
  },
  textarea: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#0f172a",
    resize: "vertical",
    lineHeight: "1.5",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    margin: "0 0 12px 0",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #e2e8f0",
  },
  cancelBtn: {
    padding: "10px 17px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 18px",
    backgroundColor: "#1d4ed8",
    border: "none",
    borderRadius: "7px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default IdeaSubmission;