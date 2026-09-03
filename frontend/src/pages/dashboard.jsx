import { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import IdeaSubmissionModal from '../component/ideaSubmission';
import ProjectDetailModal from '../component/ProjectDetailModal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  const handleLogout = () => {
    // Authentication cleanup will go here later
   // console.log('Logging out user...');
  };

  const handleIdeaSubmit = (ideaText) => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newProject = {
      id: Date.now(),

      title:
        ideaText.length > 30
          ? `${ideaText.substring(0, 30)}...`
          : ideaText,

      description: ideaText,

      status: 'Idea Submitted',

      dateText: `Submitted on ${today}`,

      // Initial project tasks
      tasks: [
        {
          id: 1,
          text: 'Initial Scope & Architecture Brief',
          completed: true
        },
        {
          id: 2,
          text: 'Feasibility Analysis',
          completed: false
        },
        {
          id: 3,
          text: 'Project Scope & Tech Stack',
          completed: false
        },
        {
          id: 4,
          text: 'Milestone & Timeline Planning',
          completed: false
        },
        {
          id: 5,
          text: 'Risk Assessment',
          completed: false
        }
      ]
    };

    setProjects((previousProjects) => [
      newProject,
      ...previousProjects
    ]);

    setIsModalOpen(false);
  };

  // Open project details
  const handleProjectOpen = (project) => {
    setSelectedProject(project);
  };

  // Close project details
  const handleProjectClose = () => {
    setSelectedProject(null);
  };

  // Toggle project task
  const handleToggleTask = (projectId, taskId) => {
    setProjects((previousProjects) =>
      previousProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        const updatedTasks = project.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed
              }
            : task
        );

        return {
          ...project,
          tasks: updatedTasks
        };
      })
    );

    // Update the currently opened project
    setSelectedProject((previousProject) => {
      if (!previousProject) {
        return null;
      }

      const updatedTasks = previousProject.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed
            }
          : task
      );

      return {
        ...previousProject,
        tasks: updatedTasks
      };
    });
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

      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      <div style={styles.mainContent}>

        {/* Header */}
        <Header
          user={{
            name: 'Student',
            role: 'Student'
          }}
        />

        <main style={styles.pageBody}>

          {/* Page Header */}
          <div style={styles.bannerRow}>

            <div>
              <h1 style={styles.welcomeTitle}>
                Welcome back, Student
              </h1>

              <p style={styles.welcomeSubtitle}>
                Manage and track all your academic projects in one place.
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

          {/* Project Section */}
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
                No project ideas submitted yet. Click above to submit
                your first idea.
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
                    <button
                      type="button"
                      style={styles.arrowButton}
                      onClick={() => handleProjectOpen(project)}
                      aria-label={`View ${project.title}`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                  </div>

                ))}

              </div>

            )}

            {/* Footer */}
            <div style={styles.footerText}>
              Showing {projects.length} of {projects.length} projects
            </div>

          </section>

        </main>

      </div>

      {/* Idea Submission Modal */}
      <IdeaSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleIdeaSubmit}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={handleProjectClose}
        onToggleTask={handleToggleTask}
      />

    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
   /* backgroundColor: '#f8fafc',*/
   background: '#f4f9ff',
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
    backgroundColor: '#ffffff'
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

  arrowButton: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: 0
  },

  footerText: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '20px'
  }
};

export default Dashboard;