import { useEffect, useState } from 'react';
import Sidebar from '../common/sidebar';
import Header from '../common/header';
import IdeaSubmissionModal from '../component/ideaSubmission';
import AIAnalysis from '../component/AIAnalysis';
import ProjectDetailModal from '../component/ProjectDetailModal';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
  // =====================================================
  // MODAL STATES
  // =====================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isProjectDetailOpen, setIsProjectDetailOpen] =
    useState(false);

  // =====================================================
  // PROJECT STATES
  // =====================================================

  const [projects, setProjects] = useState([]);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [selectedAnalysisProject, setSelectedAnalysisProject] =
    useState(null);

  const [projectProgress, setProjectProgress] =
    useState([]);

  // =====================================================
  // AI STATES
  // =====================================================

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isEvaluatingProgress, setIsEvaluatingProgress] =
    useState(false);

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
          `${API_BASE_URL}/projects/`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            'PROJECT LOAD ERROR:',
            data
          );
          return;
        }

        if (!Array.isArray(data)) {
          console.error(
            'PROJECT LOAD ERROR: Expected array but received:',
            data
          );
          return;
        }

        // -------------------------------------------------
        // Only show projects belonging to logged-in student
        // -------------------------------------------------

        const studentProjects = data.filter(
          (project) =>
            String(project.student_id) ===
            String(student.student_id)
        );

        // -------------------------------------------------
        // Convert backend format to frontend format
        // -------------------------------------------------

        const formattedProjects =
          studentProjects.map((project) => ({
            id: project.project_id,

            project_id: project.project_id,

            student_id: project.student_id,

            title: project.title || '',

            description:
              project.description || '',

            domain:
              project.domain || '',

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
                : project.status ||
                  'Under Analysis',

            ai_analysis:
              project.ai_analysis || null,

            progress:
              Array.isArray(project.progress)
                ? project.progress
                : [],

            dateText: project.created_at
              ? `Submitted on ${new Date(
                  project.created_at
                ).toLocaleDateString(
                  'en-GB',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }
                )}`
              : 'Submitted'
          }));

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

    // If your application has a login route:
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
      // 2. Get form data
      // -------------------------------------------------

      const title =
        formData.title?.trim() || '';

      const description =
        formData.description?.trim() || '';

      const domain =
        formData.domain?.trim() || '';

      const problemStatement =
        formData.problemStatement?.trim() || '';

      const expectedOutcome =
        formData.expectedOutcome?.trim() || '';

      // -------------------------------------------------
      // 3. Validate required fields
      // -------------------------------------------------

      if (!title || !description) {
        alert(
          'Please enter the project title and description.'
        );
        return;
      }

      // -------------------------------------------------
      // 4. Create project ID
      // -------------------------------------------------

      const projectId = `proj-${Date.now()}`;

      // -------------------------------------------------
      // 5. Prepare project data
      // -------------------------------------------------

      const projectData = {
        project_id: projectId,

        student_id:
          student.student_id,

        title,

        description,

        domain,

        problemStatement,

        expectedOutcome,

        status: 'not_started'
      };

      console.log(
        'CREATING PROJECT:',
        projectData
      );

      // -------------------------------------------------
      // 6. Save project to backend
      // -------------------------------------------------

      const projectResponse = await fetch(
        `${API_BASE_URL}/projects/`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify(
            projectData
          )
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
          typeof projectResult.detail ===
            'string'
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
      // 7. Create frontend project object
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

        student_id:
          student.student_id,

        title,

        description,

        domain,

        problemStatement,

        expectedOutcome,

        status: 'Under Analysis',

        ai_analysis: null,

        progress: [],

        dateText:
          `Submitted on ${today}`
      };

      // -------------------------------------------------
      // 8. Add project to UI
      // -------------------------------------------------

      setProjects(
        (previousProjects) => [
          newProject,
          ...previousProjects
        ]
      );

      // Select project for AI analysis
      setSelectedAnalysisProject(
        newProject
      );

      // Close submission modal
      setIsModalOpen(false);

      // -------------------------------------------------
      // 9. Start AI analysis
      // -------------------------------------------------

      setIsAnalyzing(true);

      console.log(
        'STARTING AI ANALYSIS:',
        projectId
      );

      const aiResponse = await fetch(
        `${API_BASE_URL}/projects/${projectId}/analyze`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
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
          typeof aiData.detail ===
            'string'
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
      // 10. Get analysis result
      // -------------------------------------------------

      const analysis =
        aiData.analysis || aiData;

      // -------------------------------------------------
      // 11. Update AI analysis project
      // -------------------------------------------------

      setSelectedAnalysisProject(
        (previousProject) => {
          if (!previousProject) {
            return previousProject;
          }

          return {
            ...previousProject,

            status:
              'Analysis Completed',

            ai_analysis:
              analysis
          };
        }
      );

      // -------------------------------------------------
      // 12. Update project list
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
  // OPEN AI ANALYSIS
  // =====================================================

  const handleProjectOpen = (project) => {
    setSelectedAnalysisProject(project);
  };

  // =====================================================
  // CLOSE AI ANALYSIS
  // =====================================================

  const handleProjectClose = () => {
    setSelectedAnalysisProject(null);
  };

  // =====================================================
  // LOAD PROJECT PROGRESS
  // =====================================================

  const loadProjectProgress = async (
    project
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${project.project_id}/progress`
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'PROGRESS LOAD ERROR:',
          data
        );

        return [];
      }

      return Array.isArray(data.progress)
        ? data.progress
        : [];
    } catch (error) {
      console.error(
        'PROGRESS FETCH ERROR:',
        error
      );

      return [];
    }
  };

  // =====================================================
  // OPEN PROJECT DETAILS
  // =====================================================

  const handleProjectDetailsOpen = async (
    project
  ) => {
    console.log(
      'OPENING PROJECT DETAILS:',
      project.project_id
    );

    const progress =
      await loadProjectProgress(project);

    const projectWithProgress = {
      ...project,
      progress
    };

    setSelectedProject(
      projectWithProgress
    );

    setProjectProgress(progress);

    setIsProjectDetailOpen(true);
  };

  // =====================================================
  // CLOSE PROJECT DETAILS
  // =====================================================

  const handleProjectDetailsClose = () => {
    setIsProjectDetailOpen(false);

    setSelectedProject(null);

    setProjectProgress([]);
  };

  // =====================================================
  // EVALUATE PROJECT PROGRESS WITH AI
  // =====================================================

  const handleProgressEvaluation = async () => {
    if (!selectedProject) {
      alert(
        'Please select a project first.'
      );
      return;
    }

    try {
      setIsEvaluatingProgress(true);

      console.log(
        'STARTING PROGRESS EVALUATION:',
        selectedProject.project_id
      );

      const response = await fetch(
        `${API_BASE_URL}/ai/evaluate-progress`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            project_id:
              selectedProject.project_id
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'PROGRESS EVALUATION ERROR:',
          data
        );

        alert(
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(
                data.detail,
                null,
                2
              )
        );

        return;
      }

      console.log(
        'PROGRESS EVALUATION RESULT:',
        data
      );

      // -------------------------------------------------
      // Reload latest progress after evaluation
      // -------------------------------------------------

      const latestProgress =
        await loadProjectProgress(
          selectedProject
        );

      setProjectProgress(
        latestProgress
      );

      setSelectedProject(
        (previousProject) => {
          if (!previousProject) {
            return previousProject;
          }

          return {
            ...previousProject,

            progress:
              latestProgress
          };
        }
      );

      // -------------------------------------------------
      // Also update project list
      // -------------------------------------------------

      setProjects(
        (previousProjects) =>
          previousProjects.map(
            (project) =>
              project.project_id ===
              selectedProject.project_id
                ? {
                    ...project,

                    progress:
                      latestProgress
                  }
                : project
          )
      );

      alert(
        'Project progress evaluated successfully!'
      );
    } catch (error) {
      console.error(
        'PROGRESS EVALUATION FETCH ERROR:',
        error
      );

      alert(
        'Unable to connect to the progress evaluation service.'
      );
    } finally {
      setIsEvaluatingProgress(false);
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Analysis Completed':
        return {
          backgroundColor:
            '#dcfce7',

          color: '#166534'
        };

      case 'Under Analysis':
        return {
          backgroundColor:
            '#dbeafe',

          color: '#1d4ed8'
        };

      case 'Idea Submitted':
        return {
          backgroundColor:
            '#fef3c7',

          color: '#92400e'
        };

      case 'Draft':
        return {
          backgroundColor:
            '#f1f5f9',

          color: '#475569'
        };

      case 'Rejected':
        return {
          backgroundColor:
            '#fee2e2',

          color: '#b91c1c'
        };

      default:
        return {
          backgroundColor:
            '#f1f5f9',

          color: '#475569'
        };
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        onLogout={handleLogout}
      />

      <div
        style={styles.mainContent}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Header
          user={{
            name: 'Student',
            role: 'Student'
          }}
          onProfileClick={() => window.location.href = "/profile"}
        />

        <main
          style={styles.content}
        >

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            style={styles.pageHeader}
          >

            <div>

              <h1
                style={styles.heading}
              >
                Dashboard
              </h1>

              <p
                style={styles.subHeading}
              >
                Track your academic projects
                and AI-powered analysis.
              </p>

            </div>

            <button
              type="button"
              style={
                styles.submitIdeaButton
              }
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
            <div
              style={
                styles.analysisBox
              }
            >
              AI is analyzing your
              project...
            </div>
          )}

          {/* =================================================
              PROJECT SECTION
          ================================================= */}

          <section
            style={styles.section}
          >

            <div
              style={
                styles.sectionHeader
              }
            >

              <div>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  My Projects
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Track your submitted
                  projects and view their
                  AI-powered analysis.
                </p>

              </div>

              <span
                style={
                  styles.projectCount
                }
              >
                {projects.length}{' '}
                Project
                {projects.length !== 1
                  ? 's'
                  : ''}
              </span>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {projects.length === 0 && (
              <div
                style={
                  styles.emptyState
                }
              >

                <h3
                  style={
                    styles.emptyTitle
                  }
                >
                  No projects submitted
                  yet
                </h3>

                <p
                  style={
                    styles.emptyText
                  }
                >
                  Submit your project idea
                  to receive AI-powered
                  project planning and
                  mentorship.
                </p>

                <button
                  type="button"
                  style={
                    styles.emptyButton
                  }
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
              <div
                style={
                  styles.projectList
                }
              >

                {projects.map(
                  (project) => {

                    const badgeStyle =
                      getBadgeStyle(
                        project.status
                      );

                    return (
                      <div
                        key={
                          project.id
                        }
                        style={{
                          ...styles.projectCard,

                          ...(selectedProject?.id ===
                          project.id
                            ? styles.selectedProjectCard
                            : {})
                        }}
                      >

                        {/* PROJECT INFORMATION */}

                        <div
                          style={
                            styles.projectInfo
                          }
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
                              {
                                project.title
                              }
                            </h3>

                            <span
                              style={{
                                ...styles.statusBadge,

                                ...badgeStyle
                              }}
                            >
                              {
                                project.status
                              }
                            </span>

                          </div>

                          <p
                            style={
                              styles.projectDescription
                            }
                          >
                            {
                              project.description
                            }
                          </p>

                          {project.domain && (
                            <p
                              style={
                                styles.projectDomain
                              }
                            >
                              Domain:{' '}
                              {
                                project.domain
                              }
                            </p>
                          )}

                          <p
                            style={
                              styles.projectDate
                            }
                          >
                            {
                              project.dateText
                            }
                          </p>

                        </div>

                        {/* =================================================
                            PROJECT ACTIONS
                        ================================================= */}

                        <div
                          style={
                            styles.projectActions
                          }
                        >

                          {/* DETAILS */}

                          <button
                            type="button"
                            style={
                              styles.detailsButton
                            }
                            onClick={() =>
                              handleProjectDetailsOpen(
                                project
                              )
                            }
                          >
                            Details
                          </button>

                          {/* AI ANALYSIS */}

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

                      </div>
                    );
                  }
                )}

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

          IMPORTANT:
          Uses selectedAnalysisProject separately from
          selectedProject so Details and AI Analysis do
          not interfere with each other.
      ===================================================== */}

      <AIAnalysis
        project={
          selectedAnalysisProject
        }
        onClose={
          handleProjectClose
        }
      />

      {/* =====================================================
          PROJECT DETAILS MODAL
      ===================================================== */}

      {isProjectDetailOpen &&
        selectedProject && (
          <ProjectDetailModal
            project={
              selectedProject
            }

            progress={
              projectProgress
            }

            onClose={
              handleProjectDetailsClose
            }

            onEvaluateProgress={
              handleProgressEvaluation
            }

            isEvaluatingProgress={
              isEvaluatingProgress
            }
          />
        )}

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
    minHeight: '100vh',
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden'
  },

  content: {
    padding: '32px 40px'
  },

  pageHeader: {
    display: 'flex',

    justifyContent:
      'space-between',

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

    border:
      '1px solid #bfdbfe',

    borderRadius: '8px',

    padding: '12px 16px',

    marginBottom: '20px',

    color: '#1d4ed8',

    fontSize: '14px',

    fontWeight: '500'
  },

  section: {
    backgroundColor: '#ffffff',

    border:
      '1px solid #e2e8f0',

    borderRadius: '12px',

    padding: '24px'
  },

  sectionHeader: {
    display: 'flex',

    justifyContent:
      'space-between',

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

    gap: '12px',
    maxHeight: '600px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '8px'
  },

  projectCard: {
    display: 'flex',

    alignItems: 'center',

    justifyContent:
      'space-between',

    gap: '20px',

    padding: '18px',

    border:
      '1px solid #e2e8f0',

    borderRadius: '10px',

    backgroundColor: '#ffffff'
  },

  selectedProjectCard: {
    border:
      '1px solid #93c5fd',

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

    WebkitBoxOrient:
      'vertical',

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

  // =====================================================
  // PROJECT ACTIONS
  // =====================================================

  projectActions: {
    display: 'flex',

    alignItems: 'center',

    gap: '8px',

    flexShrink: 0
  },

  detailsButton: {
    padding: '8px 12px',

    borderRadius: '8px',

    border:
      '1px solid #e2e8f0',

    backgroundColor: '#f8fafc',

    color: '#334155',

    fontSize: '12px',

    fontWeight: '600',

    cursor: 'pointer',

    whiteSpace: 'nowrap'
  },

  arrowButton: {
    width: '38px',

    height: '38px',

    borderRadius: '8px',

    border:
      '1px solid #e2e8f0',

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

    border:
      '1px dashed #cbd5e1',

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