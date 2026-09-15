import React from 'react';

const AIAnalysis = ({ project, onClose }) => {
  if (!project) {
    return null;
  }

  /*
    AI analysis will  come from the backend.

    Expected structure can be something like:

    project.aiAnalysis = {
      scope: ...,
      feasibility: ...,
      technologies: [...],
      technologyReasoning: [...],
      milestones: [...],
      risks: [...]
    }

   
  */

  const analysis = project.aiAnalysis;

  return (
    <div style={styles.overlay}>

      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>

          <div>
            <h2 style={styles.title}>
              AI Project Analysis
            </h2>

            <p style={styles.projectTitle}>
              {project.title}
            </p>
          </div>

          <button
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>

        </div>

        {/* Project Information */}
        <section style={styles.projectInfoSection}>

          <h3 style={styles.sectionTitle}>
            Project Information
          </h3>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
              Description
            </span>

            <p style={styles.infoText}>
              {project.description}
            </p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
              Problem Statement
            </span>

            <p style={styles.infoText}>
              {project.problemStatement}
            </p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
              Expected Outcome
            </span>

            <p style={styles.infoText}>
              {project.expectedOutcome}
            </p>
          </div>

        </section>

        {/* No AI Analysis Yet */}
        {!analysis && (
          <div style={styles.emptyAnalysis}>

            <div style={styles.loadingIcon}>
              AI
            </div>

            <h3 style={styles.emptyTitle}>
              AI Analysis Not Available
            </h3>

            <p style={styles.emptyText}>
              The AI analysis for this project has not been
              received yet. Once the backend completes the
              analysis, the results will appear here.
            </p>

          </div>
        )}

        {/* AI Analysis Results */}
        {analysis && (
          <div style={styles.analysisContainer}>

            {/* Project Scope */}
            <section style={styles.analysisSection}>

              <h3 style={styles.sectionTitle}>
                1. Project Scope
              </h3>

              <div style={styles.resultBox}>
                {analysis.scope}
              </div>

            </section>

            {/* Feasibility */}
            <section style={styles.analysisSection}>

              <h3 style={styles.sectionTitle}>
                2. Feasibility
              </h3>

              <div style={styles.resultBox}>

                {typeof analysis.feasibility === 'object' ? (
                  <>
                    {analysis.feasibility.status && (
                      <p>
                        <strong>Status:</strong>{' '}
                        {analysis.feasibility.status}
                      </p>
                    )}

                    {analysis.feasibility.level && (
                      <p>
                        <strong>Level:</strong>{' '}
                        {analysis.feasibility.level}
                      </p>
                    )}

                    {analysis.feasibility.explanation && (
                      <p>
                        {analysis.feasibility.explanation}
                      </p>
                    )}
                  </>
                ) : (
                  analysis.feasibility
                )}

              </div>

            </section>

            {/* Technologies */}
            <section style={styles.analysisSection}>

              <h3 style={styles.sectionTitle}>
                3. Technology Recommendations
              </h3>

              <div style={styles.technologyList}>

                {analysis.technologies?.map(
                  (technology, index) => (
                    <div
                      key={index}
                      style={styles.technologyCard}
                    >

                      <h4 style={styles.technologyName}>
                        {technology.name}
                      </h4>

                      {technology.purpose && (
                        <p style={styles.resultText}>
                          <strong>Purpose:</strong>{' '}
                          {technology.purpose}
                        </p>
                      )}

                    </div>
                  )
                )}

              </div>

            </section>

            {/* Technology Reasoning */}
            <section style={styles.analysisSection}>

              <h3 style={styles.sectionTitle}>
                4. Technology Reasoning
              </h3>

              <div style={styles.resultBox}>

                {analysis.technologyReasoning?.map(
                  (reason, index) => (
                    <p key={index}>
                      {typeof reason === 'string'
                        ? reason
                        : reason.reasoning}
                    </p>
                  )
                )}

              </div>

            </section>

            {/* Milestones */}
            <section style={styles.analysisSection}>

              <h3 style={styles.sectionTitle}>
                5. Milestone Plan
              </h3>

              <div style={styles.milestoneList}>

                {analysis.milestones?.map(
                  (milestone, index) => (
                    <div
                      key={index}
                      style={styles.milestoneCard}
                    >

                      <div style={styles.week}>
                        {milestone.week ||
                          `Week ${index + 1}`}
                      </div>

                      <div>
                        <h4 style={styles.milestoneTitle}>
                          {milestone.title}
                        </h4>

                        {milestone.description && (
                          <p style={styles.resultText}>
                            {milestone.description}
                          </p>
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* Risks */}
            <section style={styles.analysisSection}>

              <h3 style={styles.sectionTitle}>
                6. Risks & Mitigation
              </h3>

              <div style={styles.riskList}>

                {analysis.risks?.map(
                  (risk, index) => (
                    <div
                      key={index}
                      style={styles.riskCard}
                    >

                      <h4 style={styles.riskTitle}>
                        {risk.title || risk.risk}
                      </h4>

                      {risk.impact && (
                        <p style={styles.resultText}>
                          <strong>Impact:</strong>{' '}
                          {risk.impact}
                        </p>
                      )}

                      {risk.mitigation && (
                        <p style={styles.resultText}>
                          <strong>Mitigation:</strong>{' '}
                          {risk.mitigation}
                        </p>
                      )}

                    </div>
                  )
                )}

              </div>

            </section>

          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>

          <button
            onClick={onClose}
            style={styles.closeFooterButton}
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },

  modal: {
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    borderBottom: '1px solid #e2e8f0'
  },

  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a'
  },

  projectTitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#64748b'
  },

  closeButton: {
    width: '34px',
    height: '34px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '22px',
    cursor: 'pointer'
  },

  projectInfoSection: {
    margin: '20px 24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },

  analysisContainer: {
    padding: '0 24px'
  },

  analysisSection: {
    marginBottom: '24px'
  },

  sectionTitle: {
    margin: '0 0 12px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#0f172a'
  },

  infoItem: {
    marginBottom: '14px'
  },

  infoLabel: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569'
  },

  infoText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#334155'
  },

  resultBox: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#334155'
  },

  technologyList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },

  technologyCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff'
  },

  technologyName: {
    margin: '0 0 8px',
    fontSize: '15px',
    color: '#1d4ed8'
  },

  resultText: {
    margin: '6px 0',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#475569'
  },

  milestoneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  milestoneCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },

  week: {
    minWidth: '70px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1d4ed8'
  },

  milestoneTitle: {
    margin: 0,
    fontSize: '15px',
    color: '#0f172a'
  },

  riskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  riskCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff'
  },

  riskTitle: {
    margin: '0 0 8px',
    fontSize: '15px',
    color: '#0f172a'
  },

  emptyAnalysis: {
    margin: '20px 24px 24px',
    padding: '50px 24px',
    textAlign: 'center',
    border: '1px dashed #cbd5e1',
    borderRadius: '10px',
    backgroundColor: '#f8fafc'
  },

  loadingIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 16px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700'
  },

  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#334155'
  },

  emptyText: {
    maxWidth: '550px',
    margin: '0 auto',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#64748b'
  },

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '20px 24px',
    borderTop: '1px solid #e2e8f0'
  },

  closeFooterButton: {
    padding: '9px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default AIAnalysis;