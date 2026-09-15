import { useEffect, useState } from 'react';
import Sidebar from '../common/sidebar';
import Header from '../common/header';
import IdeaSubmissionModal from '../component/ideaSubmission';
import AIAnalysis from '../component/AIAnalysis';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // =====================================================
  // LOAD PROJECTS
  // =====================================================
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const student = JSON.parse(
          localStorage.getItem('student')
        );

        if (!student) {
          console.warn('No logged-in student found.');
          return;
        }

        const response = await fetch(
          'http://127.0.0.1:8000/projects/'
        );

        const data = await response.json();

        if (!response.ok) {
          console.error('PROJECT LOAD ERROR:', data);
          return;
        }

        // Only show projects belonging to logged-in student
        const studentProjects = data.filter(
          (project) =>
            String(project.student_id) ===
            String(student.student_id)
        );

        // Convert backend format to frontend format
        const formattedProjects = studentProjects.map(
          (project) => ({
            id: project.project_id,
            project_id: project.project_id,
            student_id: project.student_id,

            title: project.title || '',
            description: project.description || '',
            domain: project.domain || '',

            problemStatement:
              project.problemStatement ||
              project.problem_statement ||
              '',

            expectedOutcome:
              project.expectedOutcome ||
              project.expected_outcome ||
              '',

            status:
              project.status === 'not_started'
                ? 'Under Analysis'
                : project.status || 'Under Analysis',

            ai_analysis:
              project.ai_analysis || null,

            dateText: project.created_at
              ? `Submitted on ${new Date(
                  project.created_at
                ).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}`
              : 'Submitted'
          })
        );

        setProjects(formattedProjects);

        console.log(
          'PROJECTS LOADED:',
          formattedProjects
        );
      } catch (error) {
        console.error(
          'ERROR LOADING PROJECTS:',
          error
        );
      }
    };

    loadProjects();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem('student');

    console.log('Logging out user...');

    // If you have a login route, you can use:
    // window.location.href = '/login';
  };

  // =====================================================
  // SUBMIT PROJECT IDEA
  // =====================================================
  const handleIdeaSubmit = async (formData) => {
    try {
      // -------------------------------------------------
      // 1. Get logged-in student
      // -------------------------------------------------
      const student = JSON.parse(
        localStorage.getItem('student')
      );

      if (!student) {
        alert('Please log in again.');
        return;
      }

      // -------------------------------------------------
      // 2. Get data from IdeaSubmission
      // -------------------------------------------------
      const title = formData.title?.trim() || '';
      const description =
        formData.description?.trim() || '';
      const domain = formData.domain?.trim() || '';
      const problemStatement =
        formData.problemStatement?.trim() || '';
      const expectedOutcome =
        formData.expectedOutcome?.trim() || '';

      // -------------------------------------------------
      // 3. Create project ID
      // -------------------------------------------------
      const projectId = `proj-${Date.now()}`;

      // -------------------------------------------------
      // 4. Prepare project object
      // -------------------------------------------------
      const projectData = {
        project_id: projectId,
        student_id: student.student_id,
        title,
        description,
        domain,
        problemStatement,
        expectedOutcome,
        status: 'not_started'
      };

     { /*console.log(
        'PROJECT DATA:',
        projectData
      );*/}

      // -------------------------------------------------
      // 5. Save project to MongoDB / FastAPI
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

      const projectResult =
        await projectResponse.json();

      if (!projectResponse.ok) {
        console.error(
          'PROJECT API ERROR:',
          projectResult
        );

        alert(
          typeof projectResult.detail === 'string'
            ? projectResult.detail
            : JSON.stringify(
                projectResult.detail,
                null,
                2
              )
        );

        return;
      }

      console.log(
        'PROJECT CREATED:',
        projectResult
      );

      // -------------------------------------------------
      // 6. Add project immediately to UI
      // -------------------------------------------------
      const today =
        new Date().toLocaleDateString(
          'en-GB',
          {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }
        );

      const newProject = {
        id: projectId,
        project_id: projectId,
        student_id: student.student_id,

        title,
        description,
        domain,
        problemStatement,
        expectedOutcome,

        status: 'Under Analysis',

        ai_analysis: null,

        dateText: `Submitted on ${today}`
      };

      setProjects((previousProjects) => [
        newProject,
        ...previousProjects
      ]);

      // Automatically select newly submitted project
      setSelectedProject(newProject);

      // Close modal
      setIsModalOpen(false);

      // -------------------------------------------------
      // 7. Start AI analysis
      // -------------------------------------------------
      setIsAnalyzing(true);

      console.log(
        'STARTING AI ANALYSIS:',
        projectId
      );

      const aiResponse = await fetch(
        `http://127.0.0.1:8000/projects/${projectId}/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const aiData =
        await aiResponse.json();

      if (!aiResponse.ok) {
        console.error(
          'AI API ERROR:',
          aiData
        );

        alert(
          typeof aiData.detail === 'string'
            ? aiData.detail
            : JSON.stringify(
                aiData.detail,
                null,
                2
              )
        );

        setIsAnalyzing(false);
        return;
      }

      console.log(
        'AI ANALYSIS RESULT:',
        aiData
      );

      // -------------------------------------------------
      // 8. Get analysis
      // -------------------------------------------------
      const analysis =
        aiData.analysis || aiData;

      // -------------------------------------------------
      // 9. Update selected project
      // -------------------------------------------------
      setSelectedProject(
        (previousProject) => {
          if (!previousProject) {
            return previousProject;
          }

          return {
            ...previousProject,

            status: 'Analysis Completed',

            ai_analysis: analysis
          };
        }
      );

      // -------------------------------------------------
      // 10. Update project list
      // -------------------------------------------------
      setProjects(
        (previousProjects) =>
          previousProjects.map(
            (project) =>
              project.id === projectId
                ? {
                    ...project,

                    status:
                      'Analysis Completed',

                    ai_analysis:
                      analysis
                  }
                : project
          )
      );

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

  // =====================================================
  // OPEN PROJECT ANALYSIS
  // =====================================================
  const handleProjectOpen = (project) => {
    setSelectedProject(project);
  };

  // =====================================================
  // CLOSE PROJECT ANALYSIS
  // =====================================================
  const handleProjectClose = () => {
    setSelectedProject(null);
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Analysis Completed':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534'
        };

      case 'Under Analysis':
        return {
          backgroundColor: '#dbeafe',
          color: '#1d4ed8'
        };

      case 'Idea Submitted':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
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

  // =====================================================
  // UI
  // =====================================================
  return (
    <div style={styles.page}>

      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
      />

      <div style={styles.mainContent}>

        {/* Header */}
        <Header
          user={{
            name: 'Student',
            role: 'Student'
          }}
        />

        <main style={styles.content}>

          {/* =================================================
              PAGE HEADER
          ================================================= */}
          <div style={styles.pageHeader}>

            <div>
              <h1 style={styles.heading}>
                Dashboard
              </h1>

              <p style={styles.subHeading}>
                Track your academic projects and
                AI-powered analysis.
              </p>
            </div>

            <button
              type="button"
              style={styles.submitIdeaButton}
              onClick={() =>
                setIsModalOpen(true)
              }
            >
              + Submit Project Idea
            </button>

          </div>

          {/* =================================================
              AI ANALYSIS STATUS
          ================================================= */}
          {isAnalyzing && (
            <div style={styles.analysisBox}>
              AI is analyzing your project...
            </div>
          )}

          {/* =================================================
              PROJECT SECTION
          ================================================= */}
          <section style={styles.section}>

            <div style={styles.sectionHeader}>

              <div>
                <h2
                  style={styles.sectionTitle}
                >
                  My Projects
                </h2>

                <p
                  style={styles.sectionSubtitle}
                >
                  Track your submitted projects
                  and view their AI-powered
                  analysis.
                </p>
              </div>

              <span
                style={styles.projectCount}
              >
                {projects.length} Project
                {projects.length !== 1
                  ? 's'
                  : ''}
              </span>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}
            {projects.length === 0 && (
              <div style={styles.emptyState}>

                <h3
                  style={styles.emptyTitle}
                >
                  No projects submitted yet
                </h3>

                <p
                  style={styles.emptyText}
                >
                  Submit your project idea to
                  receive AI-powered project
                  planning and mentorship.
                </p>

                <button
                  type="button"
                  style={styles.emptyButton}
                  onClick={() =>
                    setIsModalOpen(true)
                  }
                >
                  Submit Project Idea
                </button>

              </div>
            )}

            {/* =================================================
                PROJECT LIST
            ================================================= */}
            {projects.length > 0 && (
              <div style={styles.projectList}>

                {projects.map((project) => {

                  const badgeStyle =
                    getBadgeStyle(
                      project.status
                    );

                  return (
                    <div
                      key={project.id}
                      style={{
                        ...styles.projectCard,

                        ...(selectedProject?.id ===
                        project.id
                          ? styles.selectedProjectCard
                          : {})
                      }}
                    >

                      <div
                        style={styles.projectInfo}
                      >

                        <div
                          style={
                            styles.projectTopRow
                          }
                        >

                          <h3
                            style={
                              styles.projectTitle
                            }
                          >
                            {project.title}
                          </h3>

                          <span
                            style={{
                              ...styles.statusBadge,
                              ...badgeStyle
                            }}
                          >
                            {project.status}
                          </span>

                        </div>

                        <p
                          style={
                            styles.projectDescription
                          }
                        >
                          {project.description}
                        </p>

                        {project.domain && (
                          <p
                            style={
                              styles.projectDomain
                            }
                          >
                            Domain:{' '}
                            {project.domain}
                          </p>
                        )}

                        <p
                          style={
                            styles.projectDate
                          }
                        >
                          {project.dateText}
                        </p>

                      </div>

                      {/* View Analysis */}
                      <button
                        type="button"
                        style={
                          styles.arrowButton
                        }
                        onClick={() =>
                          handleProjectOpen(
                            project
                          )
                        }
                        aria-label="View project analysis"
                      >
                        →
                      </button>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

        </main>

      </div>

      {/* =====================================================
          PROJECT SUBMISSION MODAL
      ===================================================== */}
      <IdeaSubmissionModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        onSubmit={handleIdeaSubmit}
      />

      {/* =====================================================
          AI ANALYSIS MODAL
      ===================================================== */}
      <AIAnalysis
        project={selectedProject}
        onClose={handleProjectClose}
      />

    </div>
  );
};

// =========================================================
// STYLES
// =========================================================

const styles = {

  page: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  },

  mainContent: {
    flex: 1,
    minWidth: 0,
    minHeight: '100vh'
  },

  content: {
    padding: '32px 40px'
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    gap: '20px'
  },

  heading: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a'
  },

  subHeading: {
    margin: '8px 0 0',
    fontSize: '14px',
    color: '#64748b'
  },

  submitIdeaButton: {
    padding: '11px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
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

  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px'
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '20px'
  },

  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a'
  },

  sectionSubtitle: {
    margin: '6px 0 0',
    fontSize: '13px',
    color: '#64748b'
  },

  projectCount: {
    fontSize: '13px',
    color: '#64748b',
    whiteSpace: 'nowrap'
  },

  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  projectCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    padding: '18px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff'
  },

  selectedProjectCard: {
    border: '1px solid #93c5fd',
    backgroundColor: '#eff6ff'
  },

  projectInfo: {
    flex: 1,
    minWidth: 0
  },

  projectTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },

  projectTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 9px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '500'
  },

  projectDescription: {
    margin: '8px 0 5px',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#475569',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  projectDomain: {
    margin: '0 0 5px',
    fontSize: '12px',
    color: '#64748b'
  },

  projectDate: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8'
  },

  arrowButton: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#1d4ed8',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    border: '1px dashed #cbd5e1',
    borderRadius: '10px',
    backgroundColor: '#f8fafc'
  },

  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#334155'
  },

  emptyText: {
    maxWidth: '480px',
    margin: '0 auto 20px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#64748b'
  },

  emptyButton: {
    padding: '10px 16px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default Dashboard;
