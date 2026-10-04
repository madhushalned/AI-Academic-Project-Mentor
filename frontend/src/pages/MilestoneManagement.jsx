import { useEffect, useState } from "react";
import MilestoneCard from "../components/MilestoneCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import TaskList from "../components/TaskList.jsx";
import Icon from "../components/Icon.jsx";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function MilestoneManagement() {
  const [milestones, setMilestones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Resolve the active project
  // ---------------------------------------------------------
  const resolveProjectId = async () => {
    const params = new URLSearchParams(
      window.location.search
    );

    const queryProjectId =
      params.get("project_id");

    if (queryProjectId) {
      localStorage.setItem(
        "activeProjectId",
        queryProjectId
      );

      return queryProjectId;
    }

    const storedProjectId =
      localStorage.getItem(
        "activeProjectId"
      );

    if (storedProjectId) {
      return storedProjectId;
    }

    try {
      const student = JSON.parse(
        localStorage.getItem("student") || "null"
      );

      if (!student?.student_id) {
        return null;
      }

      const response = await fetch(
        `${API_BASE_URL}/projects/`
      );

      if (!response.ok) {
        return null;
      }

      const projects = await response.json();

      if (!Array.isArray(projects)) {
        return null;
      }

      const studentProjects =
        projects.filter(
          (project) =>
            String(project.student_id) ===
            String(student.student_id)
        );

      if (studentProjects.length === 0) {
        return null;
      }

      const latestProject =
        studentProjects[
          studentProjects.length - 1
        ];

      localStorage.setItem(
        "activeProjectId",
        latestProject.project_id
      );

      return latestProject.project_id;

    } catch (err) {
      console.error(
        "PROJECT ID RESOLUTION ERROR:",
        err
      );

      return null;
    }
  };

  // ---------------------------------------------------------
  // Load milestones + progress from backend
  // ---------------------------------------------------------
  const loadMilestones = async () => {
    try {
      setLoading(true);
      setError("");

      const projectId =
        await resolveProjectId();

      if (!projectId) {
        setError(
          "No project is available. Please open a project from the Dashboard first."
        );

        setLoading(false);
        return;
      }

      const [
        milestoneResponse,
        progressResponse
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/projects/${projectId}/milestones`
        ),
        fetch(
          `${API_BASE_URL}/projects/${projectId}/progress`
        )
      ]);

      const milestoneData =
        await milestoneResponse.json();

      const progressData =
        await progressResponse.json();

      if (!milestoneResponse.ok) {
        throw new Error(
          milestoneData?.detail ||
            "Failed to load milestones."
        );
      }

      if (!progressResponse.ok) {
        throw new Error(
          progressData?.detail ||
            "Failed to load project progress."
        );
      }

      const backendMilestones =
        Array.isArray(milestoneData)
          ? milestoneData
          : Array.isArray(
              milestoneData?.milestones
            )
          ? milestoneData.milestones
          : [];

      const backendProgress =
        Array.isArray(progressData)
          ? progressData
          : Array.isArray(
              progressData?.progress
            )
          ? progressData.progress
          : [];

      // -------------------------------------------------------
      // Create quick lookup by week
      // -------------------------------------------------------
      const progressByWeek = {};

      backendProgress.forEach((item) => {
        progressByWeek[
          Number(item.week)
        ] = item;
      });

      // -------------------------------------------------------
      // Helper: determine milestone status
      // -------------------------------------------------------
      const getMilestoneStatus = (
        progressItem
      ) => {
        const progressValue =
          Number(
            progressItem?.progress
          ) || 0;

        const rawStatus =
          String(
            progressItem?.status || ""
          )
            .trim()
            .toLowerCase();

        // Completed has highest priority
        if (
          progressValue >= 100 ||
          rawStatus === "completed"
        ) {
          return "Completed";
        }

        // IMPORTANT:
        // Preserve backend At Risk status
        if (
          rawStatus === "at risk" ||
          rawStatus === "at-risk"
        ) {
          return "At Risk";
        }

        // Partial progress without risk
        if (progressValue > 0) {
          return "In Progress";
        }

        return "Not Started";
      };

      // ---------------------------------------------------------
      // Map milestones with actual backend progress
      // ---------------------------------------------------------
      const mappedMilestones =
        backendMilestones.map(
          (milestone, index) => {
            const week = Number(
              milestone.week ?? index + 1
            );

            const progressItem =
              progressByWeek[week];

            const progressValue =
              Number(
                progressItem?.progress
              ) || 0;

            const status =
              getMilestoneStatus(
                progressItem
              );

            const weekProgress =
              status === "Completed"
                ? 100
                : Math.max(
                    0,
                    Math.min(
                      99,
                      progressValue
                    )
                  );

            const priority =
              Array.isArray(
                milestone.priorities
              ) &&
              milestone.priorities.length > 0
                ? milestone.priorities[0]
                : "Normal";

            const tasks =
              Array.isArray(
                milestone.tasks
              )
                ? milestone.tasks.map(
                    (
                      task,
                      taskIndex
                    ) => ({
                      id: `${week}-${taskIndex}`,
                      title: task,

                      // A task is considered
                      // completed only when
                      // the entire week is completed.
                      done:
                        status ===
                        "Completed"
                    })
                  )
                : [];

            return {
              id: week,

              week,

              title:
                milestone.title ||
                `Week ${week}`,

              description:
                Array.isArray(
                  milestone.deliverables
                ) &&
                milestone.deliverables.length >
                  0
                  ? milestone.deliverables.join(
                      ", "
                    )
                  : "AI-generated milestone plan.",

              status,

              priority,

              progress:
                weekProgress,

              timeline:
                milestone.timeline ||
                "Planned timeline",

              dependencies:
                Array.isArray(
                  milestone.dependencies
                )
                  ? milestone.dependencies
                  : [],

              deliverables:
                Array.isArray(
                  milestone.deliverables
                )
                  ? milestone.deliverables
                  : [],

              tasks,

              remarks:
                progressItem?.remarks ||
                null
            };
          }
        );

      setMilestones(
        mappedMilestones
      );

    } catch (err) {
      console.error(
        "MILESTONE LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load milestone data."
      );

      setMilestones([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  // ---------------------------------------------------------
  // Open milestone
  // ---------------------------------------------------------
  const openMilestone = (
    milestone
  ) => {
    setSelected(milestone);
  };

  const closeMilestone = () => {
    setSelected(null);
  };

  // ---------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------
  const filtered =
    filter === "All"
      ? milestones
      : milestones.filter(
          (milestone) =>
            milestone.status ===
            filter
        );

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="milestone-management">
        <div className="panel">
          <p className="panel-empty">
            Loading milestones...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Detail view
  // ---------------------------------------------------------
  if (selected) {
    return (
      <div className="milestone-detail">

        <button
          className="btn btn-ghost back-btn"
          onClick={closeMilestone}
        >
          <Icon
            name="arrowLeft"
            size={18}
          />

          Back to Milestones
        </button>

        <div className="milestone-detail-head">

          <div>
            <span className="week-badge">
              Week {selected.week}
            </span>

            <h2>
              {selected.title}
            </h2>

            <p className="milestone-detail-desc">
              {selected.description}
            </p>
          </div>

          <StatusBadge
            status={
              selected.status
            }
          />

        </div>

        <div className="milestone-detail-meta">

          <div className="meta-item">
            <span className="meta-label">
              Timeline
            </span>

            <span className="meta-value">
              {selected.timeline}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">
              Priority
            </span>

            <span
              className={`meta-value priority priority-${String(
                selected.priority
              ).toLowerCase()}`}
            >
              {selected.priority}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">
              Progress
            </span>

            <span className="meta-value">
              {selected.progress}%
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">
              Tasks
            </span>

            <span className="meta-value">
              {
                selected.tasks.filter(
                  (task) =>
                    task.done
                ).length
              }
              /
              {
                selected.tasks.length
              }
            </span>
          </div>

        </div>

        <div className="milestone-detail-grid">

          <section className="panel">

            <div className="panel-head">
              <h3>
                Milestone Progress
              </h3>
            </div>

            <div className="milestone-card-progress">

              <div className="milestone-card-progress-head">

                <span>
                  Week{" "}
                  {selected.week}
                </span>

                <span>
                  {selected.progress}%
                </span>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${selected.progress}%`
                  }}
                />

              </div>

            </div>

            <div className="panel-section">

              <h4>
                Dependencies
              </h4>

              {selected.dependencies
                .length > 0 ? (
                <ul>
                  {selected.dependencies.map(
                    (
                      dependency,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {dependency}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  No dependencies.
                </p>
              )}

            </div>

            <div className="panel-section">

              <h4>
                Deliverables
              </h4>

              {selected.deliverables
                .length > 0 ? (
                <ul>
                  {selected.deliverables.map(
                    (
                      deliverable,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {deliverable}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  No deliverables listed.
                </p>
              )}

            </div>

            {selected.remarks && (
              <div className="panel-section">

                <h4>
                  Progress Remarks
                </h4>

                <p>
                  {selected.remarks}
                </p>

              </div>
            )}

          </section>

          <section className="panel">

            <TaskList
              tasks={
                selected.tasks
              }
            />

          </section>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------
  // Main milestone list
  // ---------------------------------------------------------
  return (
    <div className="milestone-management">

      {error && (
        <div className="panel">

          <p className="panel-empty">
            {error}
          </p>

        </div>
      )}

      {/* =====================================================
          FILTERS
          ===================================================== */}
      <div className="filter-bar">

        {[
          "All",
          "Not Started",
          "In Progress",
          "Completed",
          "At Risk"
        ].map((status) => (

          <button
            key={status}
            className={`filter-chip ${
              filter === status
                ? "active"
                : ""
            }`}
            onClick={() =>
              setFilter(status)
            }
          >
            {status}
          </button>

        ))}

      </div>

      {/* =====================================================
          MILESTONE GRID
          ===================================================== */}
      <div className="milestone-grid">

        {filtered.map(
          (milestone) => (

            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onView={
                openMilestone
              }
            />

          )
        )}

      </div>

      {filtered.length === 0 &&
        !error && (
          <p className="panel-empty">
            No milestones match this
            filter.
          </p>
        )}

    </div>
  );
}