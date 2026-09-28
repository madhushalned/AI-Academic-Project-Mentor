import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/sidebar';
import Header from '../common/header';
import IdeaSubmissionModal from '../component/ideaSubmission';
import AIAnalysis from '../component/AIAnalysis';
import ProjectDetailModal from '../component/ProjectDetailModal';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // MODAL STATES
  // =====================================================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);

  // =====================================================
  // PROJECT STATES
  // =====================================================

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAnalysisProject, setSelectedAnalysisProject] =
    useState(null);
  const [projectProgress, setProjectProgress] = useState([]);

  // =====================================================
  // AI STATES
  // =====================================================

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvaluatingProgress, setIsEvaluatingProgress] = useState(false);

  // =====================================================
  // PROGRESS STATES
  // =====================================================

  const [completingWeek, setCompletingWeek] = useState(null);

  // =====================================================
  // PREVENT DUPLICATE AI EVALUATION REQUESTS
  // =====================================================

  const progressEvaluationRunningRef = useRef(false);

  // =====================================================
  // CALCULATE OVERALL PROGRESS
  // =====================================================
  //
  // Overall progress is based ONLY on completed weeks.
  //
  // Example:
  // 3 completed weeks / 7 total weeks = 42.86%
  //
  // Each completed week = 100%
  // Each incomplete week = 0%
  //
  // =====================================================

  const calculateOverallProgress = (
    progressList,
    milestones = []
  ) => {
    const totalWeeks = milestones.length;

    if (totalWeeks === 0) {
      return 0;
    }

    const completedWeeks = progressList.filter(
      (item) =>
        String(item?.status || '').toLowerCase() === 'completed' ||
        Number(item?.current_progress ?? item?.progress ?? 0) >= 100
    ).length;

    return Math.round(
      (completedWeeks / totalWeeks) * 100
    );
  };

  // =====================================================
  // NORMALIZE PROGRESS DATA
  // =====================================================

  const normalizeProgress = (progressList = []) => {
    if (!Array.isArray(progressList)) {
      return [];
    }

    return progressList.map((item) => {
      const currentProgress = Number(
        item?.current_progress ??
        item?.progress ??
        0
      );

      const isCompleted =
        String(item?.status || '').toLowerCase() ===
          'completed' ||
        currentProgress >= 100;

      return {
        ...item,

        week: Number(item?.week),

        status: isCompleted
          ? 'Completed'
          : 'Not Started',

        current_progress: isCompleted
          ? 100
          : 0,

        // Keep old field temporarily for backend compatibility
        progress: isCompleted
          ? 100
          : 0
      };
    });
  };

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
          console.warn(
            'No logged-in student found.'
          );
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

        const studentProjects = data.filter(
          (project) =>
            String(project.student_id) ===
            String(student.student_id)
        );

        const formattedProjects =
          studentProjects.map(
            (project) => {
              const normalizedProgress =
                normalizeProgress(
                  Array.isArray(project.progress)
                    ? project.progress
                    : []
                );

              return {
                id: project.project_id,
                project_id: project.project_id,
                student_id: project.student_id,

                title: project.title || '',
                description:
                  project.description || '',
                domain: project.domain || '',

                expectedOutcome:
                  project.expectedOutcome ||
                  project.expected_outcome ||
                  '',

                status:
                  project.status ===
                  'not_started'
                    ? 'Under Analysis'
                    : project.status ||
                      'Under Analysis',

                ai_analysis:
                  project.ai_analysis || null,

                progress:
                  normalizedProgress,

                // Maximum possible progress
                total_progress: 100,

                progress_evaluation:
                  project.progress_evaluation ||
                  null,

                dateText:
                  project.created_at
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
              };
            }
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
    sessionStorage.clear();

    console.log(
      'Logging out user...'
    );

    navigate('/login');
  };

  // =====================================================
  // SUBMIT PROJECT IDEA
  // =====================================================

  const handleIdeaSubmit = async (
    formData
  ) => {
    try {
      const student = JSON.parse(
        localStorage.getItem('student')
      );

      if (!student) {
        throw new Error(
          'Please log in again.'
        );
      }

      const title =
        formData.title?.trim() || '';

      const description =
        formData.description?.trim() || '';

      const domain =
        formData.domain?.trim() || '';

      const expectedOutcome =
        formData.expectedOutcome?.trim() || '';

      if (!title) {
        throw new Error(
          'Project title is required.'
        );
      }

      if (!domain) {
        throw new Error(
          'Project domain is required.'
        );
      }

      if (!description) {
        throw new Error(
          'Project description / problem statement is required.'
        );
      }

      if (!expectedOutcome) {
        throw new Error(
          'Expected outcome is required.'
        );
      }

      const projectId = `proj-${Date.now()}`;

      const projectData = {
        project_id: projectId,
        student_id: student.student_id,
        title,
        description,
        domain,
        expectedOutcome,
        status: 'not_started'
      };

      console.log(
        'CREATING PROJECT:',
        projectData
      );

      const projectResponse =
        await fetch(
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

        const message =
          typeof projectResult.detail ===
          'string'
            ? projectResult.detail
            : JSON.stringify(
                projectResult.detail,
                null,
                2
              );

        throw new Error(message);
      }

      const createdProjectId =
        projectResult.project_id ||
        projectResult.id ||
        projectId;

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
        id: createdProjectId,
        project_id: createdProjectId,
        student_id:
          student.student_id,

        title,
        description,
        domain,
        expectedOutcome,

        status: 'Under Analysis',

        ai_analysis: null,
        progress: [],

        total_progress: 100,

        progress_evaluation: null,

        dateText: `Submitted on ${today}`
      };

      setProjects(
        (previousProjects) => [
          newProject,
          ...previousProjects
        ]
      );

      setSelectedAnalysisProject(
        newProject
      );

      setIsModalOpen(false);

      // =================================================
      // AUTOMATIC AI ANALYSIS
      // =================================================

      setIsAnalyzing(true);

      console.log(
        'STARTING AUTOMATIC AI ANALYSIS:',
        createdProjectId
      );

      const aiResponse =
        await fetch(
          `${API_BASE_URL}/projects/${createdProjectId}/analyze`,
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

        const message =
          typeof aiData.detail ===
          'string'
            ? aiData.detail
            : JSON.stringify(
                aiData.detail,
                null,
                2
              );

        throw new Error(
          `AI analysis failed: ${message}`
        );
      }

      const analysis =
        aiData.analysis ||
        aiData.ai_analysis ||
        aiData;

      const completedProject = {
        ...newProject,

        status:
          'Analysis Completed',

        ai_analysis:
          analysis
      };

      setSelectedAnalysisProject(
        completedProject
      );

      setProjects(
        (previousProjects) =>
          previousProjects.map(
            (project) =>
              project.project_id ===
              createdProjectId
                ? completedProject
                : project
          )
      );

      // =================================================
      // RELOAD PROJECT
      // =================================================

      try {
        const latestResponse =
          await fetch(
            `${API_BASE_URL}/projects/${createdProjectId}`
          );

        const latestProject =
          await latestResponse.json();

        if (latestResponse.ok) {
          const backendProgress =
            normalizeProgress(
              Array.isArray(
                latestProject.progress
              )
                ? latestProject.progress
                : []
            );

          const backendProject = {
            ...completedProject,

            id:
              latestProject.project_id ||
              createdProjectId,

            project_id:
              latestProject.project_id ||
              createdProjectId,

            student_id:
              latestProject.student_id ||
              student.student_id,

            title:
              latestProject.title ||
              title,

            description:
              latestProject.description ||
              description,

            domain:
              latestProject.domain ||
              domain,

            expectedOutcome:
              latestProject.expectedOutcome ||
              latestProject.expected_outcome ||
              expectedOutcome,

            status:
              'Analysis Completed',

            ai_analysis:
              latestProject.ai_analysis ||
              analysis,

            progress:
              backendProgress,

            total_progress: 100,

            progress_evaluation:
              latestProject.progress_evaluation ||
              null
          };

          setSelectedAnalysisProject(
            backendProject
          );

          setProjects(
            (previousProjects) =>
              previousProjects.map(
                (project) =>
                  project.project_id ===
                  createdProjectId
                    ? backendProject
                    : project
              )
          );
        }
      } catch (
        refreshError
      ) {
        console.warn(
          'Could not refresh project after analysis:',
          refreshError
        );
      }

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
        error?.message ||
          'Unable to connect to the server.'
      );

      throw error;
    }
  };

  // =====================================================
  // OPEN AI ANALYSIS
  // =====================================================

  const handleProjectOpen = (
    project
  ) => {
    setSelectedAnalysisProject(
      project
    );
  };

  // =====================================================
  // CLOSE AI ANALYSIS
  // =====================================================

  const handleProjectClose = () => {
    setSelectedAnalysisProject(
      null
    );
  };

  // =====================================================
  // LOAD PROJECT PROGRESS
  // =====================================================

  const loadProjectProgress = async (
    project
  ) => {
    try {
      if (!project?.project_id) {
        return [];
      }

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

      let progressData = [];

      if (Array.isArray(data)) {
        progressData = data;
      } else if (
        Array.isArray(data?.progress)
      ) {
        progressData = data.progress;
      }

      return normalizeProgress(
        progressData
      );
    } catch (error) {
      console.error(
        'PROGRESS FETCH ERROR:',
        error
      );

      return [];
    }
  };

  // =====================================================
  // LOAD PROJECT MILESTONES
  // =====================================================

  const loadProjectMilestones =
    async (project) => {
      try {
        if (!project?.project_id) {
          return [];
        }

        const response =
          await fetch(
            `${API_BASE_URL}/projects/${project.project_id}/milestones`
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            'MILESTONE LOAD ERROR:',
            data
          );

          return [];
        }

        if (Array.isArray(data)) {
          return data;
        }

        return Array.isArray(
          data?.milestones
        )
          ? data.milestones
          : [];
      } catch (error) {
        console.error(
          'MILESTONE FETCH ERROR:',
          error
        );

        return [];
      }
    };

  // =====================================================
  // OPEN PROJECT DETAILS
  // =====================================================

  const handleProjectDetailsOpen =
    async (project) => {
      console.log(
        'OPENING PROJECT DETAILS:',
        project.project_id
      );

      const progress =
        await loadProjectProgress(
          project
        );

      const milestones =
        await loadProjectMilestones(
          project
        );

      console.log(
        'LOADED MILESTONES:',
        milestones
      );

      const overallProgress =
        calculateOverallProgress(
          progress,
          milestones
        );

      const projectWithProgress = {
        ...project,

        progress,

        total_progress: 100,

        overall_progress:
          overallProgress,

        ai_analysis: {
          ...(project.ai_analysis ||
            {}),
          milestones
        }
      };

      setSelectedProject(
        projectWithProgress
      );

      setProjectProgress(
        progress
      );

      setIsProjectDetailOpen(
        true
      );
    };

  // =====================================================
  // CLOSE PROJECT DETAILS
  // =====================================================

  const handleProjectDetailsClose =
    () => {
      setIsProjectDetailOpen(false);
      setSelectedProject(null);
      setProjectProgress([]);

      setCompletingWeek(null);
    };

  // =====================================================
  // UPDATE PROJECT PROGRESS IN UI
  // =====================================================

  const updateProjectProgressState =
    (
      projectId,
      latestProgress,
      milestones = []
    ) => {
      const normalizedProgress =
        normalizeProgress(
          latestProgress
        );

      const overallProgress =
        calculateOverallProgress(
          normalizedProgress,
          milestones
        );

      setProjectProgress(
        normalizedProgress
      );

      setSelectedProject(
        (previousProject) => {
          if (
            !previousProject ||
            previousProject.project_id !==
              projectId
          ) {
            return previousProject;
          }

          return {
            ...previousProject,

            progress:
              normalizedProgress,

            total_progress: 100,

            overall_progress:
              overallProgress
          };
        }
      );

      setProjects(
        (previousProjects) =>
          previousProjects.map(
            (project) =>
              project.project_id ===
              projectId
                ? {
                    ...project,

                    progress:
                      normalizedProgress,

                    total_progress: 100
                  }
                : project
          )
      );
    };

  // =====================================================
  // EVALUATE PROJECT PROGRESS WITH AI
  // =====================================================
  //
  // IMPORTANT:
  // This function is NOT called while editing progress.
  //
  // It is called ONLY after a week is completed.
  //
  // =====================================================

  const handleProgressEvaluation =
    async (
      projectId = null
    ) => {
      const targetProjectId =
        projectId ||
        selectedProject?.project_id;

      if (!targetProjectId) {
        console.error(
          'No project ID available for evaluation.'
        );
        return null;
      }

      if (
        progressEvaluationRunningRef.current
      ) {
        console.log(
          'AI progress evaluation is already running. Skipping duplicate request.'
        );

        return null;
      }

      progressEvaluationRunningRef.current =
        true;

      setIsEvaluatingProgress(
        true
      );

      try {
        console.log(
          'STARTING PROGRESS EVALUATION:',
          targetProjectId
        );

        const response =
          await fetch(
            `${API_BASE_URL}/ai/evaluate-progress`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body: JSON.stringify({
                project_id:
                  targetProjectId
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

          const message =
            typeof data.detail ===
            'string'
              ? data.detail
              : JSON.stringify(
                  data.detail,
                  null,
                  2
                );

          throw new Error(
            message
          );
        }

        console.log(
          'PROGRESS EVALUATION RESULT:',
          data
        );

        // =================================================
        // GET FRESH PROJECT PROGRESS
        // =================================================

        let latestProgress =
          await loadProjectProgress(
            selectedProject
          );

        // =================================================
        // GET MILESTONES
        // =================================================

        let latestMilestones =
          selectedProject?.ai_analysis
            ?.milestones || [];

        if (
          latestMilestones.length ===
          0
        ) {
          latestMilestones =
            await loadProjectMilestones(
              selectedProject
            );
        }

        // =================================================
        // CALCULATE OVERALL PROGRESS
        // =================================================

        const overallProgress =
          calculateOverallProgress(
            latestProgress,
            latestMilestones
          );

        const evaluation =
          data.evaluation || {};

        /*
         * The overall progress shown in the UI
         * is based ONLY on completed weeks.
         *
         * Do not calculate it from partial
         * weekly percentages.
         */

        const updatedEvaluation = {
          ...evaluation,

          progress_score:
            overallProgress,

          completed_weeks:
            latestProgress.filter(
              (item) =>
                String(
                  item?.status || ''
                ).toLowerCase() ===
                  'completed' ||
                Number(
                  item?.current_progress ??
                    item?.progress ??
                    0
                ) >= 100
            ).length
        };

        // =================================================
        // UPDATE PROGRESS
        // =================================================

        setProjectProgress(
          latestProgress
        );

        // =================================================
        // UPDATE SELECTED PROJECT
        // =================================================

        setSelectedProject(
          (previousProject) => {
            if (
              !previousProject ||
              previousProject.project_id !==
                targetProjectId
            ) {
              return previousProject;
            }

            return {
              ...previousProject,

              progress:
                latestProgress,

              total_progress: 100,

              overall_progress:
                overallProgress,

              progress_evaluation:
                updatedEvaluation
            };
          }
        );

        // =================================================
        // UPDATE PROJECT LIST
        // =================================================

        setProjects(
          (previousProjects) =>
            previousProjects.map(
              (project) =>
                project.project_id ===
                targetProjectId
                  ? {
                      ...project,

                      progress:
                        latestProgress,

                      total_progress: 100,

                      progress_evaluation:
                        updatedEvaluation
                    }
                  : project
            )
        );

        console.log(
          'OVERALL PROGRESS:',
          overallProgress
        );

        console.log(
          'NEW AI EVALUATION SAVED TO UI:',
          updatedEvaluation
        );

        return updatedEvaluation;
      } catch (error) {
        console.error(
          'PROGRESS EVALUATION ERROR:',
          error
        );

        if (
          String(
            error?.message || ''
          )
            .toLowerCase()
            .includes(
              'executor is already running'
            )
        ) {
          console.warn(
            'CrewAI executor is already running. Duplicate evaluation was prevented.'
          );

          return null;
        }

        alert(
          error?.message ||
            'Unable to connect to the progress evaluation service.'
        );

        return null;
      } finally {
        progressEvaluationRunningRef.current =
          false;

        setIsEvaluatingProgress(
          false
        );
      }
    };

  // =====================================================
  // MARK WEEK COMPLETE
  // =====================================================
  //
  // This is now the ONLY way to update weekly progress.
  //
  // A completed week:
  //
  // current_progress = 100
  // status = Completed
  //
  // No remarks.
  // No Save Progress.
  // No partial progress.
  //
  // =====================================================

  const handleMarkWeekComplete =
    async (week) => {
      if (!selectedProject) {
        alert(
          'Please select a project first.'
        );
        return false;
      }

      const numericWeek =
        Number(week);

      if (
        Number.isNaN(
          numericWeek
        ) ||
        numericWeek < 1
      ) {
        alert(
          'Invalid week number.'
        );
        return false;
      }

      const projectId =
        selectedProject.project_id;

      try {
        setCompletingWeek(
          numericWeek
        );

        // =================================================
        // GET CURRENT SERVER PROGRESS
        // =================================================

        const currentProgress =
          await loadProjectProgress(
            selectedProject
          );

        const existingWeek =
          currentProgress.find(
            (item) =>
              Number(item?.week) ===
              numericWeek
          );

        // =================================================
        // ALREADY COMPLETED
        // =================================================

        if (
          existingWeek &&
          (
            Number(
              existingWeek?.current_progress ??
                existingWeek?.progress ??
                0
            ) >= 100 ||
            String(
              existingWeek?.status ||
              ''
            ).toLowerCase() ===
              'completed'
          )
        ) {
          console.log(
            `Week ${numericWeek} is already completed.`
          );

          updateProjectProgressState(
            projectId,
            currentProgress,
            selectedProject?.ai_analysis
              ?.milestones || []
          );

          return true;
        }

        // =================================================
        // CREATE COMPLETED WEEK
        // =================================================

        const completedProgress = {
          week: numericWeek,

          status: 'Completed',

          current_progress: 100,

          // Keep this temporarily for backend
          // compatibility if required.
          progress: 100
        };

        console.log(
          'MARKING WEEK COMPLETE:',
          completedProgress
        );

        // =================================================
        // SAVE COMPLETED WEEK
        // =================================================

        const response =
          await fetch(
            `${API_BASE_URL}/projects/${projectId}/progress`,
            {
              method: 'PUT',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body: JSON.stringify(
                completedProgress
              )
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          console.error(
            'MARK WEEK COMPLETE ERROR:',
            data
          );

          const message =
            typeof data.detail ===
            'string'
              ? data.detail
              : JSON.stringify(
                  data.detail,
                  null,
                  2
                );

          throw new Error(
            message
          );
        }

        console.log(
          'WEEK COMPLETED:',
          data
        );

        // =================================================
        // GET FRESH PROGRESS
        // =================================================

        const latestProgress =
          await loadProjectProgress(
            selectedProject
          );

        console.log(
          'LATEST PROGRESS AFTER COMPLETION:',
          latestProgress
        );

        // =================================================
        // GET MILESTONES
        // =================================================

        let milestones =
          selectedProject?.ai_analysis
            ?.milestones || [];

        if (
          milestones.length === 0
        ) {
          milestones =
            await loadProjectMilestones(
              selectedProject
            );
        }

        // =================================================
        // CALCULATE OVERALL PROGRESS
        // =================================================

        const overallProgress =
          calculateOverallProgress(
            latestProgress,
            milestones
          );

        console.log(
          'COMPLETED WEEKS:',
          latestProgress.filter(
            (item) =>
              String(
                item?.status || ''
              ).toLowerCase() ===
                'completed' ||
              Number(
                item?.current_progress ??
                  item?.progress ??
                  0
              ) >= 100
          ).length
        );

        console.log(
          'TOTAL WEEKS:',
          milestones.length
        );

        console.log(
          'OVERALL PROGRESS:',
          `${overallProgress}%`
        );

        // =================================================
        // UPDATE UI IMMEDIATELY
        // =================================================

        updateProjectProgressState(
          projectId,
          latestProgress,
          milestones
        );

        setSelectedProject(
          (previousProject) => {
            if (
              !previousProject ||
              previousProject.project_id !==
                projectId
            ) {
              return previousProject;
            }

            return {
              ...previousProject,

              progress:
                latestProgress,

              total_progress: 100,

              overall_progress:
                overallProgress
            };
          }
        );

        // =================================================
        // AUTOMATIC AI EVALUATION
        // =================================================

        console.log(
          `STARTING AUTOMATIC AI EVALUATION AFTER WEEK ${numericWeek}`
        );

        const evaluation =
          await handleProgressEvaluation(
            projectId
          );

        console.log(
          'AUTOMATIC AI EVALUATION COMPLETED:',
          evaluation
        );

        alert(
          `Week ${numericWeek} completed successfully. Overall progress: ${overallProgress}%.`
        );

        return true;
      } catch (error) {
        console.error(
          'MARK WEEK COMPLETE ERROR:',
          error
        );

        alert(
          error?.message ||
            'Unable to mark the week as completed.'
        );

        return false;
      } finally {
        setCompletingWeek(
          null
        );
      }
    };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getBadgeStyle = (
    status
  ) => {
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

      <Sidebar
        onLogout={handleLogout}
      />

      <div
        style={styles.mainContent}
      >

        <Header
          user={{
            name: 'Student',
            role: 'Student'
          }}
          onProfileClick={() =>
            window.location.href =
              '/profile'
          }
        />

        <main
          style={styles.content}
        >

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
                style={
                  styles.subHeading
                }
              >
                Track your academic
                projects and
                AI-powered analysis.
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
                  projects and view
                  their AI-powered
                  analysis.
                </p>

              </div>

              <span
                style={
                  styles.projectCount
                }
              >
                {projects.length}{' '}
                Project
                {projects.length !==
                1
                  ? 's'
                  : ''}
              </span>

            </div>

            {projects.length ===
              0 && (
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
                  Submit your project
                  idea to receive
                  AI-powered project
                  planning and
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

            {projects.length >
              0 && (
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

                        <div
                          style={
                            styles.projectActions
                          }
                        >

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

      {/* =================================================
          PROJECT IDEA MODAL
          ================================================= */}

      <IdeaSubmissionModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        onSubmit={
          handleIdeaSubmit
        }
      />

      {/* =================================================
          AI ANALYSIS
          ================================================= */}

      <AIAnalysis
        project={
          selectedAnalysisProject
        }
        onClose={
          handleProjectClose
        }
      />

      {/* =================================================
          PROJECT DETAILS
          ================================================= */}

      {isProjectDetailOpen &&
        selectedProject && (
          <ProjectDetailModal
            project={
              selectedProject
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

            onMarkWeekComplete={
              handleMarkWeekComplete
            }

            completingWeek={
              completingWeek
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
    gap: '12px',
    maxHeight: '600px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '8px'
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

  projectActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  },

  detailsButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
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