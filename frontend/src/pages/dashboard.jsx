import { useEffect, useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import IdeaSubmissionModal from '../component/ideaSubmission';

const dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // -------------------------------------------------
  // Load existing projects from MongoDB
  // -------------------------------------------------
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
          console.error(
            'PROJECT LOAD ERROR:',
            data
          );
          return;
        }

        // Only show projects of logged-in student
        const studentProjects = data.filter(
          (project) =>
            project.student_id === student.student_id
        );

        // Convert MongoDB project format
        const formattedProjects = studentProjects.map(
          (project) => ({
            id: project.project_id,
            project_id: project.project_id,
            student_id: project.student_id,
            title: project.title,
            description: project.description,
            domain: project.domain,
            status:
              project.status === 'not_started'
                ? 'Under Analysis'
                : project.status,
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

  // -------------------------------------------------
  // Logout
  // -------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem('student');
    console.log('Logging out user...');
  };

  // -------------------------------------------------
  // Submit project idea
  // -------------------------------------------------
  const handleIdeaSubmit = async ({
    title,
    description,
    domain
  }) => {
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

      console.log(
        'PROJECT DATA:',
        projectData
      );

      // -------------------------------------------------
      // 3. Save project to MongoDB
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
        'PROJECT CREATED SUCCESSFULLY:',
        projectResult
      );

      // -------------------------------------------------
      // 4. Add project to React immediately
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
        id: projectData.project_id,
        project_id: projectData.project_id,
        student_id: projectData.student_id,
        title: title,
        description: description,
        domain: domain,
        status: 'Under Analysis',
        ai_analysis: null,
        dateText: `Submitted on ${today}`
      };

      setProjects((previousProjects) => [
        newProject,
        ...previousProjects
      ]);

      // Automatically show new project
      setSelectedProject(newProject);

      setIsModalOpen(false);

      // -------------------------------------------------
      // 5. Trigger AI analysis
      // -------------------------------------------------
      setIsAnalyzing(true);

      console.log(
        'SENDING PROJECT TO AI ANALYSIS:',
        {
          project_id:
            projectData.project_id,
          title,
          description,
          domain
        }
      );

      const aiResponse = await fetch(
        `http://127.0.0.1:8000/projects/${projectData.project_id}/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            project_id:
              projectData.project_id,
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
            : JSON.stringify(
                aiData.detail,
                null,
                2
              )
        );

        setIsAnalyzing(false);
        return;
      }

      // -------------------------------------------------
      // 6. Store AI analysis in React
      // -------------------------------------------------
      console.log(
        'AI ANALYSIS RESULT:',
        aiData
      );

      const analysis =
        aiData.analysis || aiData;

      // Update selected project
      setSelectedProject((previousProject) => {
        if (!previousProject) {
          return previousProject;
        }

        return {
          ...previousProject,
          status: 'Analysis Completed',
          ai_analysis: analysis
        };
      });

      // Update project list
      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project.id ===
          projectData.project_id
            ? {
                ...project,
                status: 'Analysis Completed',
                ai_analysis: analysis
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

  // -------------------------------------------------
  // Select project from dropdown
  // -------------------------------------------------
  const handleProjectSelect = (projectId) => {
    const project = projects.find(
      (item) =>
        item.id === projectId
    );

    setSelectedProject(
      project || null
    );
  };

  // -------------------------------------------------
  // Status badge styling
  // -------------------------------------------------
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

      case 'Analysis Completed':
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
                Manage and track all your academic
                projects in one place.
              </p>
            </div>

            <button
              type="button"
              style={styles.submitButton}
              onClick={() =>
                setIsModalOpen(true)
              }
            >
              + Submit New Project Idea
            </button>

          </div>

          {/* ------------------------------------------
              AI Analysis Status
          ------------------------------------------ */}
          {isAnalyzing && (
            <div style={styles.analysisBox}>
              AI is analyzing your project...
            </div>
          )}

          {/* ------------------------------------------
              Project List
          ------------------------------------------ */}
          <section style={styles.cardContainer}>

            <div style={styles.containerHeader}>

              <h2 style={styles.containerTitle}>
                Your Project Ideas
              </h2>

              <p style={styles.containerSubtitle}>
                Select a project to view its
                complete details and AI analysis.
              </p>

              {/* Project Dropdown */}
              {projects.length > 0 && (
                <select
                  value={
                    selectedProject?.id || ''
                  }
                  onChange={(e) =>
                    handleProjectSelect(
                      e.target.value
                    )
                  }
                  style={styles.projectSelect}
                >

                  <option value="">
                    Select a project
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.title}
                    </option>
                  ))}

                </select>
              )}

            </div>

            {/* ------------------------------------------
                Project List
            ------------------------------------------ */}
            {projects.length === 0 ? (

              <div style={styles.emptyMessage}>
                No project ideas submitted yet.
                Click above to submit your first
                idea.
              </div>

            ) : (

              <div style={styles.projectList}>

                {projects.map((project) => (

                  <div
                    key={project.id}
                    style={{
                      ...styles.projectRow,
                      ...(selectedProject?.id ===
                      project.id
                        ? styles.selectedProjectRow
                        : {})
                    }}
                    onClick={() =>
                      setSelectedProject(
                        project
                      )
                    }
                  >

                    {/* Project Information */}
                    <div
                      style={
                        styles.projectInfo
                      }
                    >

                      <h3
                        style={
                          styles.projectTitle
                        }
                      >
                        {project.title}
                      </h3>

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

                    </div>

                    {/* Status and Date */}
                    <div
                      style={
                        styles.statusContainer
                      }
                    >

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getBadgeStyle(
                            project.status
                          )
                        }}
                      >
                        {project.status}
                      </span>

                      <span
                        style={
                          styles.dateText
                        }
                      >
                        {project.dateText}
                      </span>

                    </div>

                    {/* Arrow */}
                    <div
                      style={
                        styles.arrowContainer
                      }
                    >

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

            <div style={styles.footerText}>
              Showing {projects.length} of{' '}
              {projects.length} projects
            </div>

          </section>

          {/* ------------------------------------------
              Selected Project Details
          ------------------------------------------ */}
          {selectedProject && (
            <section
              style={styles.detailsCard}
            >

              <div style={styles.detailsHeader}>

                <div>
                  <h2
                    style={styles.aiTitle}
                  >
                    Project Details
                  </h2>

                  <p
                    style={
                      styles.detailsSubtitle
                    }
                  >
                    Complete information for the
                    selected project.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={() =>
                    setSelectedProject(null)
                  }
                >
                  Close
                </button>

              </div>

              {/* Project Information */}
              <div style={styles.detailsGrid}>

                <div style={styles.detailItem}>

                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    Project Title
                  </span>

                  <span
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedProject.title}
                  </span>

                </div>

                <div style={styles.detailItem}>

                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    Domain
                  </span>

                  <span
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedProject.domain ||
                      'Not specified'}
                  </span>

                </div>

                <div
                  style={
                    styles.detailItemFull
                  }
                >

                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    Description
                  </span>

                  <p
                    style={
                      styles.detailDescription
                    }
                  >
                    {selectedProject.description ||
                      'No description available.'}
                  </p>

                </div>

                <div style={styles.detailItem}>

                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    Status
                  </span>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getBadgeStyle(
                        selectedProject.status
                      )
                    }}
                  >
                    {selectedProject.status}
                  </span>

                </div>

                <div style={styles.detailItem}>

                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    Submission Date
                  </span>

                  <span
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedProject.dateText}
                  </span>

                </div>

              </div>

              {/* ----------------------------------------
                  AI Analysis
              ---------------------------------------- */}
              <div
                style={
                  styles.analysisSection
                }
              >

                <h3
                  style={
                    styles.analysisHeading
                  }
                >
                  AI Project Analysis
                </h3>

                {selectedProject.ai_analysis ? (

                  <pre
                    style={
                      styles.aiResult
                    }
                  >
                    {typeof selectedProject.ai_analysis ===
                    'string'
                      ? selectedProject.ai_analysis
                      : JSON.stringify(
                          selectedProject.ai_analysis,
                          null,
                          2
                        )}
                  </pre>

                ) : (

                  <div
                    style={
                      styles.noAnalysisBox
                    }
                  >
                    AI analysis is not available
                    for this project yet.
                  </div>

                )}

              </div>

            </section>
          )}

        </main>
      </div>

      {/* ------------------------------------------
          Idea Submission Modal
      ------------------------------------------ */}
      <IdeaSubmissionModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
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
  height: '100vh',
  backgroundColor: '#f8fafc',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  overflowX: 'hidden'
},

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '100vh'
  },

  pageBody: {
    padding: '32px 40px',
    flex: 1,
    overflowY: 'visible'
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

  closeButton: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
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

  projectSelect: {
    marginTop: '16px',
    width: '100%',
    maxWidth: '500px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none'
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
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  selectedProjectRow: {
    border: '1px solid #93c5fd',
    backgroundColor: '#eff6ff'
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
    display: 'inline-block',
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

  detailsCard: {
    marginTop: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px'
  },

  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '20px'
  },

  detailsSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    marginBottom: '24px'
  },

  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },

  detailItemFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },

  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b'
  },

  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a'
  },

  detailDescription: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#334155',
    margin: 0
  },

  analysisSection: {
    marginTop: '10px'
  },

  analysisHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 12px 0'
  },

  noAnalysisBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '14px',
    color: '#92400e',
    fontSize: '13px'
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
    overflowX: 'auto',
    maxHeight: '600px',
    overflowY: 'auto',
    margin: 0
  }
};

export default dashboard;
