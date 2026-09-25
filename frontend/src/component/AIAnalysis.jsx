import React from 'react';

const AIAnalysis = ({ project, onClose }) => {
  if (!project) {
    return null;
  }

  const analysis = project.ai_analysis;

  const scope = analysis?.scope || {};
  const feasibility = analysis?.feasibility || {};
  const technology = analysis?.technology || {};

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
              {project.description || 'Not provided'}
            </p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
              Problem Statement
            </span>

            <p style={styles.infoText}>
              {project.problemStatement || 'Not provided'}
            </p>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>
              Expected Outcome
            </span>

            <p style={styles.infoText}>
              {project.expectedOutcome || 'Not provided'}
            </p>
          </div>
        </section>

        {/* No AI Analysis */}
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

            {/* Project Analysis */}
            <section style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>
                1. Project Analysis
              </h3>

              <div style={styles.resultBox}>
                <p style={styles.resultText}>
                  {analysis.project_analysis || 'Not available'}
                </p>
              </div>
            </section>

            {/* Project Scope */}
            <section style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>
                2. Project Scope
              </h3>

              <div style={styles.resultBox}>

                {scope.problem_statement && (
                  <div style={styles.detailItem}>
                    <strong>Problem Statement:</strong>
                    <p>{scope.problem_statement}</p>
                  </div>
                )}

                {scope.objectives?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Objectives:</strong>
                    <ul>
                      {scope.objectives.map((objective, index) => (
                        <li key={index}>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scope.in_scope?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>In Scope:</strong>
                    <ul>
                      {scope.in_scope.map((item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scope.out_of_scope?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Out of Scope:</strong>
                    <ul>
                      {scope.out_of_scope.map((item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scope.expected_outcomes?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Expected Outcomes:</strong>
                    <ul>
                      {scope.expected_outcomes.map((item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!scope.problem_statement &&
                  !scope.objectives?.length &&
                  !scope.in_scope?.length &&
                  !scope.out_of_scope?.length &&
                  !scope.expected_outcomes?.length && (
                    <p style={styles.resultText}>
                      Scope information is not available.
                    </p>
                  )}
              </div>
            </section>

            {/* Feasibility */}
            <section style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>
                3. Feasibility Analysis
              </h3>

              <div style={styles.resultBox}>

                {feasibility.score !== undefined &&
                  feasibility.score !== null && (
                    <p style={styles.resultText}>
                      <strong>Score:</strong>{' '}
                      {feasibility.score}/100
                    </p>
                  )}

                {feasibility.decision && (
                  <p style={styles.resultText}>
                    <strong>Decision:</strong>{' '}
                    {feasibility.decision}
                  </p>
                )}

                {feasibility.technical_feasibility && (
                  <p style={styles.resultText}>
                    <strong>Technical:</strong>{' '}
                    {feasibility.technical_feasibility}
                  </p>
                )}

                {feasibility.time_feasibility && (
                  <p style={styles.resultText}>
                    <strong>Time:</strong>{' '}
                    {feasibility.time_feasibility}
                  </p>
                )}

                {feasibility.resource_feasibility && (
                  <p style={styles.resultText}>
                    <strong>Resources:</strong>{' '}
                    {feasibility.resource_feasibility}
                  </p>
                )}

                {feasibility.skills_required?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Skills Required:</strong>
                    <ul>
                      {feasibility.skills_required.map(
                        (skill, index) => (
                          <li key={index}>
                            {skill}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {feasibility.limitations?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Limitations:</strong>
                    <ul>
                      {feasibility.limitations.map(
                        (limitation, index) => (
                          <li key={index}>
                            {limitation}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {!Object.keys(feasibility).length && (
                  <p style={styles.resultText}>
                    Feasibility information is not available.
                  </p>
                )}
              </div>
            </section>

            {/* Technology */}
            <section style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>
                4. Technology Recommendations
              </h3>

              <div style={styles.resultBox}>

                {technology.programming_language && (
                  <p style={styles.resultText}>
                    <strong>Programming Language:</strong>{' '}
                    {technology.programming_language}
                  </p>
                )}

                {technology.framework && (
                  <p style={styles.resultText}>
                    <strong>Framework:</strong>{' '}
                    {technology.framework}
                  </p>
                )}

                {technology.database && (
                  <p style={styles.resultText}>
                    <strong>Database:</strong>{' '}
                    {technology.database}
                  </p>
                )}

                {technology.ai_ml_tools?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>AI/ML Tools:</strong>
                    <ul>
                      {technology.ai_ml_tools.map(
                        (tool, index) => (
                          <li key={index}>
                            {tool}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {technology.libraries?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>Libraries:</strong>
                    <ul>
                      {technology.libraries.map(
                        (library, index) => (
                          <li key={index}>
                            {library}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {technology.apis?.length > 0 && (
                  <div style={styles.detailItem}>
                    <strong>External APIs:</strong>
                    <ul>
                      {technology.apis.map(
                        (api, index) => (
                          <li key={index}>
                            {api}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {technology.reasoning && (
                  <div style={styles.detailItem}>
                    <strong>Reasoning:</strong>
                    <p>{technology.reasoning}</p>
                  </div>
                )}

                {!Object.keys(technology).length && (
                  <p style={styles.resultText}>
                    Technology recommendations are not available.
                  </p>
                )}
              </div>
            </section>

            {/* Milestones */}
            <section style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>
                5. Milestone Plan
              </h3>

              <div style={styles.milestoneList}>
                {analysis.milestones?.length > 0 ? (
                  analysis.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      style={styles.milestoneCard}
                    >
                      <div style={styles.week}>
                        Week {milestone.week || index + 1}
                      </div>

                      <div style={styles.milestoneContent}>
                        <h4 style={styles.milestoneTitle}>
                          {milestone.title || 'Milestone'}
                        </h4>

                        {milestone.tasks?.length > 0 && (
                          <div>
                            <strong>Tasks:</strong>
                            <ul>
                              {milestone.tasks.map(
                                (task, taskIndex) => (
                                  <li key={taskIndex}>
                                    {typeof task === 'string'
                                      ? task
                                      : task.title || task.task}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {milestone.deliverables?.length > 0 && (
                          <div>
                            <strong>Deliverables:</strong>
                            <ul>
                              {milestone.deliverables.map(
                                (deliverable, deliverableIndex) => (
                                  <li key={deliverableIndex}>
                                    {deliverable}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {milestone.description && (
                          <p style={styles.resultText}>
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.resultBox}>
                    <p style={styles.resultText}>
                      No milestones available.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Risks */}
            <section style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>
                6. Risks & Mitigation
              </h3>

              <div style={styles.riskList}>
                {analysis.risks?.length > 0 ? (
                  analysis.risks.map((risk, index) => (
                    <div
                      key={index}
                      style={styles.riskCard}
                    >
                      <h4 style={styles.riskTitle}>
                        {risk.title || risk.risk || `Risk ${index + 1}`}
                      </h4>

                      {risk.description && (
                        <p style={styles.resultText}>
                          <strong>Description:</strong>{' '}
                          {risk.description}
                        </p>
                      )}

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
                  ))
                ) : (
                  <div style={styles.resultBox}>
                    <p style={styles.resultText}>
                      No risks available.
                    </p>
                  </div>
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

  resultText: {
    margin: '6px 0',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#475569'
  },

  detailItem: {
    marginBottom: '14px'
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

  milestoneContent: {
    flex: 1
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