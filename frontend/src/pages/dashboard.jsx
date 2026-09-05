import { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import IdeaSubmissionModal from '../component/ideaSubmission';

const dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('student');
    console.log('Logging out user...');
  };

  const handleIdeaSubmit = async ({ title, description, domain }) => {
    try {
      // -------------------------------------------------
      // 1. Get logged-in student
      // -------------------------------------------------
      const student = JSON.parse(localStorage.getItem('student'));

      if (!student) {
        alert('Please log in again.');
        return;
      }

      // -------------------------------------------------
      // 2. Prepare project data
      // -------------------------------------------------
      const projectData = {
        project_id: `proj-${Date.now()}`,
        student_id: student.student_id,
        title: title,
        description: description,
        domain: domain,
        status: 'not_started'
      };

      console.log('PROJECT DATA:', projectData);

      // -------------------------------------------------
      // 3. Create project in MongoDB through FastAPI
      // -------------------------------------------------
      const projectResponse = await fetch(
        'http://127.0.0.1:8000/projects/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        }
      );

      const projectResult = await projectResponse.json();

      if (!projectResponse.ok) {
        console.error('PROJECT API ERROR:', projectResult);

        alert(
          typeof projectResult.detail === 'string'
            ? projectResult.detail
            : JSON.stringify(projectResult.detail, null, 2)
        );

        return;
      }

      console.log(
        'PROJECT CREATED SUCCESSFULLY:',
        projectResult
      );

      // -------------------------------------------------
      // 4. Add project to dashboard
      // -------------------------------------------------
      const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const newProject = {
        id: projectData.project_id,
        title: title,
        description: description,
        domain: domain,
        status: 'Under Analysis',
        dateText: `Submitted on ${today}`
      };

      setProjects((previousProjects) => [
        newProject,
        ...previousProjects
      ]);

      setIsModalOpen(false);

      // -------------------------------------------------
      // 5. Send project to AI analysis endpoint
      // -------------------------------------------------
      setIsAnalyzing(true);

      console.log(
        'SENDING PROJECT TO AI ANALYSIS:',
        {
          title,
          description,
          domain
        }
      );

      const aiResponse = await fetch(
        'http://127.0.0.1:8000/ai/analyze-project',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          
          body: JSON.stringify({
            project_id: projectData.project_id,
            title: title,
            description: description,
            domain: domain
          })
        }
      );

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        console.error(
          'AI API ERROR:',
          aiData
        );

        alert(
          typeof aiData.detail === 'string'
            ? aiData.detail
            : JSON.stringify(aiData.detail, null, 2)
        );

        setIsAnalyzing(false);
        return;
      }

      // -------------------------------------------------
      // 6. Store AI result
      // -------------------------------------------------
      console.log(
        'AI ANALYSIS RESULT:',
        aiData
      );

      setAiResult(aiData);

      setIsAnalyzing(false);

      alert(
        'Project submitted and AI analysis completed successfully!'
      );

    } catch (error) {
      console.error(
        'PROJECT / AI INTEGRATION ERROR:',
        error
      );

      setIsAnalyzing(false);

      alert(
        'Unable to connect to the server.'
      );
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Idea Submitted':
        return {
          backgroundColor: '#dbeafe',
          color: '#1d4ed8'
        };

      case 'Under Analysis':
        return {
          backgroundColor: '#dcfce7',
          color: '#15803d'
        };

      case 'Draft':
        return {
          backgroundColor: '#f1f5f9',
          color: '#475569'
        };

      case 'Rejected':
        return {
          backgroundColor: '#fee2e2',
          color: '#b91c1c'
        };

      default:
        return {
          backgroundColor: '#f1f5f9',
          color: '#475569'
        };
    }
  };

  return (
    <div style={styles.layout}>

      <Sidebar onLogout={handleLogout} />

      <div style={styles.mainContent}>

        <Header
          user={{
            name: 'Student',
            role: 'Student'
          }}
        />

        <main style={styles.pageBody}>

          {/* ------------------------------------------
              Page Header
          ------------------------------------------ */}
          <div style={styles.bannerRow}>

            <div>
              <h1 style={styles.welcomeTitle}>
                Welcome back, Student
              </h1>

              <p style={styles.welcomeSubtitle}>
                Manage and track all your academic projects
                in one place.
              </p>
            </div>

            <button
              type="button"
              style={styles.submitButton}
              onClick={() => setIsModalOpen(true)}
            >
              + Submit New Project Idea
            </button>

          </div>

          {/* ------------------------------------------
              Analysis Status
          ------------------------------------------ */}
          {isAnalyzing && (
            <div style={styles.analysisBox}>
              AI is analyzing your project...
            </div>
          )}

          {/* ------------------------------------------
              Project Card
          ------------------------------------------ */}
          <section style={styles.cardContainer}>

            <div style={styles.containerHeader}>

              <h2 style={styles.containerTitle}>
                Your Project Ideas
              </h2>

              <p style={styles.containerSubtitle}>
                All the project ideas you have submitted.
              </p>

            </div>

            {/* Empty State */}
            {projects.length === 0 ? (

              <div style={styles.emptyMessage}>
                No project ideas submitted yet.
                Click above to submit your first idea.
              </div>

            ) : (

              <div style={styles.projectList}>

                {projects.map((project) => (

                  <div
                    key={project.id}
                    style={styles.projectRow}
                  >

                    {/* Project Information */}
                    <div style={styles.projectInfo}>

                      <h3 style={styles.projectTitle}>
                        {project.title}
                      </h3>

                      <p style={styles.projectDescription}>
                        {project.description}
                      </p>

                      {project.domain && (
                        <p style={styles.projectDomain}>
                          Domain: {project.domain}
                        </p>
                      )}

                    </div>

                    {/* Status and Date */}
                    <div style={styles.statusContainer}>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getBadgeStyle(project.status)
                        }}
                      >
                        {project.status}
                      </span>

                      <span style={styles.dateText}>
                        {project.dateText}
                      </span>

                    </div>

                    {/* Arrow */}
                    <div style={styles.arrowContainer}>

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                    </div>

                  </div>

                ))}

              </div>

            )}

            {/* Footer */}
            <div style={styles.footerText}>
              Showing {projects.length} of {projects.length} projects
            </div>

          </section>

          {/* ------------------------------------------
              AI Analysis Result
          ------------------------------------------ */}
          {aiResult && (
            <section style={styles.aiCard}>

              <h2 style={styles.aiTitle}>
                AI Project Analysis
              </h2>

              <pre style={styles.aiResult}>
                {typeof aiResult === 'string'
                  ? aiResult
                  : JSON.stringify(
                      aiResult,
                      null,
                      2
                    )}
              </pre>

            </section>
          )}

        </main>
      </div>

      {/* ------------------------------------------
          Idea Submission Modal
      ------------------------------------------ */}
      <IdeaSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleIdeaSubmit}
      />

    </div>
  );
};

const styles = {

  layout: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    margin: 0,
    padding: 0
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },

  pageBody: {
    padding: '32px 40px',
    flex: 1
  },

  bannerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    gap: '24px'
  },

  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0'
  },

  welcomeSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },

  submitButton: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  analysisBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#1d4ed8',
    fontSize: '14px',
    fontWeight: '500'
  },

  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px'
  },

  containerHeader: {
    marginBottom: '20px'
  },

  containerTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },

  containerSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },

  emptyMessage: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px'
  },

  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  projectRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },

  projectInfo: {
    flex: 1,
    paddingRight: '20px',
    minWidth: 0
  },

  projectTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },

  projectDescription: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4'
  },

  projectDomain: {
    fontSize: '12px',
    color: '#64748b',
    margin: '6px 0 0 0'
  },

  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
    marginRight: '16px',
    flexShrink: 0
  },

  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '12px'
  },

  dateText: {
    fontSize: '12px',
    color: '#94a3b8'
  },

  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  footerText: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '20px'
  },

  aiCard: {
    marginTop: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px'
  },

  aiTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 16px 0'
  },

  aiResult: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#334155',
    overflowX: 'auto'
  }
};

export default dashboard;
