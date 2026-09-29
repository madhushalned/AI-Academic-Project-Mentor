import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Timeline from "../components/Timeline.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function TimelineManagement() {
  const navigate = useNavigate();

  const [weeks, setWeeks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Resolve active project
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
  // Load timeline data
  // ---------------------------------------------------------
  const loadTimeline = async () => {
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

      const progressByWeek = {};

      backendProgress.forEach((item) => {
        progressByWeek[
          Number(item.week)
        ] = item;
      });

      const mappedWeeks =
        backendMilestones.map(
          (milestone, index) => {
            const week = Number(
              milestone.week ?? index + 1
            );

            const progressItem =
              progressByWeek[week];

            const isCompleted =
              Number(
                progressItem?.progress
              ) >= 100 ||
              String(
                progressItem?.status || ""
              ).toLowerCase() === "completed";

            const weekProgress =
              isCompleted ? 100 : 0;

            const status = isCompleted
              ? "Completed"
              : "Not Started";

            const activities =
              Array.isArray(
                milestone.tasks
              )
                ? milestone.tasks
                : [];

            return {
              week,

              title:
                milestone.title ||
                `Week ${week}`,

              status,

              progress: weekProgress,

              dateRange:
                milestone.timeline ||
                "Planned timeline",

              activities,

              milestone:
                milestone.title ||
                `Week ${week}`
            };
          }
        );

      const mappedMilestones =
        backendMilestones.map(
          (milestone, index) => {
            const week = Number(
              milestone.week ?? index + 1
            );

            const progressItem =
              progressByWeek[week];

            const isCompleted =
              Number(
                progressItem?.progress
              ) >= 100 ||
              String(
                progressItem?.status || ""
              ).toLowerCase() === "completed";

            return {
              id: week,
              week,

              title:
                milestone.title ||
                `Week ${week}`,

              status: isCompleted
                ? "Completed"
                : "Not Started",

              progress:
                isCompleted ? 100 : 0
            };
          }
        );

      setWeeks(mappedWeeks);
      setMilestones(mappedMilestones);
    } catch (err) {
      console.error(
        "TIMELINE LOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load timeline data."
      );

      setWeeks([]);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  // ---------------------------------------------------------
  // Summary
  // ---------------------------------------------------------
  const total =
    weeks.length;

  const completed =
    weeks.filter(
      (week) =>
        week.status === "Completed"
    ).length;

  const inProgress =
    weeks.filter(
      (week) =>
        week.status === "In Progress"
    ).length;

  const atRisk =
    weeks.filter(
      (week) =>
        week.status === "At Risk"
    ).length;

  const overallProgress =
    total > 0
      ? Math.round(
          (completed / total) * 100
        )
      : 0;

  // ---------------------------------------------------------
  // Filter
  // ---------------------------------------------------------
  const filtered =
    filter === "All"
      ? weeks
      : filter === "Upcoming"
      ? weeks.filter(
          (week) =>
            week.status === "Not Started"
        )
      : weeks.filter(
          (week) =>
            week.status === filter
        );

  const handleMilestoneClick = () => {
    navigate("/milestones");
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="timeline-management">
        <div className="panel">
          <p className="panel-empty">
            Loading timeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-management">
      {error && (
        <div className="panel">
          <p className="panel-empty">
            {error}
          </p>
        </div>
      )}

      <div className="timeline-overview">
        <div
          className="timeline-overview-ring"
          style={{
            "--ring-value":
              overallProgress
          }}
        >
          <span>
            {overallProgress}%
          </span>
          <p>Overall</p>
        </div>

        <div className="timeline-overview-stats">
          <div className="ts-item">
            <span className="ts-value">
              {total}
            </span>
            <span className="ts-label">
              Total Weeks
            </span>
          </div>

          <div className="ts-item">
            <span className="ts-value">
              {completed}
            </span>
            <span className="ts-label">
              Completed
            </span>
          </div>

          <div className="ts-item">
            <span className="ts-value">
              {inProgress}
            </span>
            <span className="ts-label">
              In Progress
            </span>
          </div>

          <div className="ts-item">
            <span className="ts-value">
              {atRisk}
            </span>
            <span className="ts-label">
              At Risk
            </span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        {[
          "All",
          "Upcoming",
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

      <Timeline
        weeks={filtered}
        onMilestoneClick={
          handleMilestoneClick
        }
      />

      <section className="panel timeline-milestones-panel">
        <div className="panel-head">
          <h3>Linked Milestones</h3>
        </div>

        <div className="milestone-mini-grid">
          {milestones.map(
            (milestone) => (
              <div
                key={milestone.id}
                className="milestone-mini"
                onClick={() =>
                  navigate(
                    "/milestones"
                  )
                }
              >
                <div className="milestone-mini-head">
                  <span className="milestone-mini-title">
                    {milestone.title}
                  </span>

                  <StatusBadge
                    status={
                      milestone.status
                    }
                  />
                </div>

                <div className="progress-bar sm">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${milestone.progress}%`
                    }}
                  />
                </div>

                <span className="milestone-mini-progress">
                  {milestone.progress}%
                </span>
              </div>
            )
          )}
        </div>

        {milestones.length === 0 && (
          <p className="panel-empty">
            No milestones available.
          </p>
        )}
      </section>
    </div>
  );
}