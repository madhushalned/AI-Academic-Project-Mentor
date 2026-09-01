import React, { useState } from 'react';

const ideaSubmission = ({ isOpen, onClose, onSubmit }) => {
  const [ideaText, setIdeaText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onSubmit(ideaText);
    setIdeaText('');
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Submit Project Idea</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            style={styles.textarea}
            rows="5"
            placeholder="Describe your project idea in 2-3 lines..."
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            required
          />
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#475569'
  },
  submitBtn: {
    padding: '8px 16px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

export default ideaSubmission;