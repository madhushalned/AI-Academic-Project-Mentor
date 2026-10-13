import React, { useEffect, useMemo, useState } from "react";

import FacultyHeader from "./FacultyHeader";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/faculty/projects`);

        if (!response.ok) {
          throw new Error(`Failed to load projects (HTTP ${response.status})`);
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : Array.isArray(data.projects) ? data.projects : []);
      } catch (err) {
        console.error("Faculty project loading failed:", err);
        setError(err.message || "Unable to load faculty projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);
  const openProjectDetails = async (project) => {
    setSelectedProject(project);
    setSelectedSummary(null);
    setSummaryError("");
    setSummaryLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/faculty/projects/${encodeURIComponent(project.project_id)}/summary`
      );

      if (!response.ok) {
        throw new Error(`Failed to load faculty summary (HTTP ${response.status})`);
      }

      const data = await response.json();
      const summary = data?.summary;

      if (summary && typeof summary === "object") {
        setSelectedSummary(summary);
      } else if (typeof summary === "string" && summary.trim()) {
        setSelectedSummary({ mentor_summary: summary });
      } else {
        setSelectedSummary(null);
      }
    } catch (err) {
      console.error("Faculty summary loading failed:", err);
      setSummaryError(err.message || "Unable to load the faculty summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatSummaryItem = (item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      return item.description || item.title || item.name || JSON.stringify(item);
    }
    return String(item ?? "");
  };
  const getDisplayStatus = (status) => {
    const rawStatus = String(status || "Not Started")
      .trim()
      .replace(/[_-]+/g, " ")
      .toLowerCase();

    const labels = {
      "not started": "Not Started",
      "in progress": "In Progress",
      "analysis completed": "Analysis Completed",
      "completed": "Completed",
      "on hold": "On Hold",
    };

    return labels[rawStatus] || status || "Not Started";
  };
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch = [
        project.title,
        project.student_name,
        project.student_id,
        project.domain,
      ].some((value) =>
        (value || "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" || getDisplayStatus(project.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const getRisks = (project) => {
    const risks =
      project.mentor_risk_analysis?.identified_risks ??
      project.risks ??
      project.ai_analysis?.risks;
    if (Array.isArray(risks)) return risks;
    return risks ? [risks] : [];
  };

  const getBlockers = (project) => {
    const blockers =
      project.mentor_risk_analysis?.blockers ?? project.blockers;
    if (Array.isArray(blockers)) return blockers;
    return blockers ? [blockers] : [];
  };

  const getRiskCount = (project) => {
    const risks = getRisks(project);
    return risks.length > 0
      ? risks.length
      : Number(project.risk_count ?? 0);
  };

  const getBlockerCount = (project) => {
    const blockers = getBlockers(project);
    return blockers.length > 0
      ? blockers.length
      : Number(project.blocker_count ?? 0);
  };

  return (
    <div className="faculty-page">


      <div className="faculty-main">
        <FacultyHeader />

        <main className="faculty-content">
          <div className="faculty-heading">
            <h1>Faculty Dashboard</h1>
            <p>
              Monitor student projects, progress, risks, and blockers.
            </p>
          </div>

          <div className="faculty-stats">
            <div className="faculty-stat-card">
              <span>Total Projects</span>
              <strong>{projects.length}</strong>
            </div>

            <div className="faculty-stat-card">
              <span>In Progress</span>
              <strong>
                {projects.filter((p) => getDisplayStatus(p.status) === "In Progress").length}
              </strong>
            </div>

            <div className="faculty-stat-card">
              <span>At Risk</span>
              <strong>
                {projects.filter(
                  (p) =>
                    p.health === "Needs Attention" || p.health === "At Risk" || p.health === "Critical"
                ).length}
              </strong>
            </div>

            <div className="faculty-stat-card">
              <span>Blocked Projects</span>
              <strong>
                {projects.filter((p) => getBlockerCount(p) > 0).length}
              </strong>
            </div>
          </div>

          <section className="faculty-projects-card">
            <div className="faculty-section-heading">
              <h2>Student Projects</h2>
              <p>Search and filter student projects.</p>
            </div>

            <div className="faculty-filters">
              <input
                type="search"
                placeholder="Search project, student, or domain"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Analysis Completed">Analysis Completed</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {loading && (
              <p className="faculty-message">Loading projects...</p>
            )}

            {!loading && error && (
              <p className="faculty-error">{error}</p>
            )}

            {!loading && !error && filteredProjects.length === 0 && (
              <div className="faculty-empty-state">
                <h3>No student projects available</h3>
                <p>
                  Student project information will appear here when
                  project data is connected.
                </p>
              </div>
            )}

            {!loading && !error && filteredProjects.length > 0 && (
              <div className="faculty-table-wrapper">
                <table className="faculty-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Health</th>
                      <th>Risks</th>
                      <th>Blockers</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.project_id}>
                        <td>{project.title}</td>
                        <td>{project.student_name || project.student_id || "Not provided"}</td>
                        <td>{getDisplayStatus(project.status)}</td>
                        <td>{project.progress_score ?? project.progress ?? 0}%</td>
                        <td>{project.health || "Not available"}</td>
                        <td>{getRiskCount(project)}</td>
                        <td>{getBlockerCount(project)}</td>
                        <td>
                          <button
                            className="faculty-view-button"
                            onClick={() => openProjectDetails(project)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {selectedProject && (
            <div
              className="faculty-modal-overlay"
              onClick={() => setSelectedProject(null)}
            >
              <section
                className="faculty-modal"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="faculty-close-button"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>

                <h2>{selectedProject.title}</h2>
                <p>
                  Student: {selectedProject.student_name || selectedProject.student_id || "Not provided"}
                </p>
                <p>
                  Description: {selectedProject.description || "Not available"}
                </p>
                <p>Status: {getDisplayStatus(selectedProject.status)}</p>
                <p>Progress: {selectedProject.progress_score ?? selectedProject.progress ?? 0}%</p>
                <p>Health: {selectedProject.health || "Not available"}</p>

                <h3>Risks</h3>
                {getRisks(selectedProject).length > 0 ? (
                  <ul>
                    {getRisks(selectedProject).map((risk, index) => (
                      <li key={index}>
                        {typeof risk === "string"
                          ? risk
                          : risk.description || JSON.stringify(risk)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No risks available.</p>
                )}

                <h3>Blockers</h3>
                {getBlockers(selectedProject).length > 0 ? (
                  <ul>
                    {getBlockers(selectedProject).map((blocker, index) => (
                      <li key={index}>{formatSummaryItem(blocker)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No blockers available.</p>
                )}

                <h3>AI-Generated Summary</h3>
                {summaryLoading ? (
                  <p className="faculty-message">Loading faculty summary...</p>
                ) : summaryError ? (
                  <p className="faculty-error">{summaryError}</p>
                ) : selectedSummary ? (
                  <div className="faculty-summary">
                    <p>
                      {selectedSummary.mentor_summary ||
                        "No mentor summary available."}
                    </p>

                    <h4>Key Progress Observations</h4>
                    {Array.isArray(selectedSummary.key_progress_observations) &&
                    selectedSummary.key_progress_observations.length > 0 ? (
                      <ul>
                        {selectedSummary.key_progress_observations.map((item, index) => (
                          <li key={index}>{formatSummaryItem(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None recorded.</p>
                    )}

                    <h4>Key Risks</h4>
                    {Array.isArray(selectedSummary.key_risks) &&
                    selectedSummary.key_risks.length > 0 ? (
                      <ul>
                        {selectedSummary.key_risks.map((item, index) => (
                          <li key={index}>{formatSummaryItem(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None recorded.</p>
                    )}

                    <h4>Faculty Attention</h4>
                    {Array.isArray(selectedSummary.faculty_attention) &&
                    selectedSummary.faculty_attention.length > 0 ? (
                      <ul>
                        {selectedSummary.faculty_attention.map((item, index) => (
                          <li key={index}>{formatSummaryItem(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No faculty attention items recorded.</p>
                    )}

                    <h4>Recommended Follow-up</h4>
                    {Array.isArray(selectedSummary.recommended_follow_up) &&
                    selectedSummary.recommended_follow_up.length > 0 ? (
                      <ul>
                        {selectedSummary.recommended_follow_up.map((item, index) => (
                          <li key={index}>{formatSummaryItem(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No follow-up recommendations recorded.</p>
                    )}
                  </div>
                ) : (
                  <p>No AI summary is currently available.</p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;