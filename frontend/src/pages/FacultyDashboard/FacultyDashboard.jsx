import React, { useMemo, useState } from "react";

import FacultyHeader from "./FacultyHeader";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const [projects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading] = useState(false);
  const [error] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch = [
        project.title,
        project.student_name,
        project.domain,
      ].some((value) =>
        (value || "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const getRisks = (project) => {
    const risks = project.risks ?? project.ai_analysis?.risks;
    if (Array.isArray(risks)) return risks;
    return risks ? [risks] : [];
  };

  const getBlockers = (project) => {
    const blockers = project.blockers;
    if (Array.isArray(blockers)) return blockers;
    return blockers ? [blockers] : [];
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
                {projects.filter((p) => p.status === "In Progress").length}
              </strong>
            </div>

            <div className="faculty-stat-card">
              <span>At Risk</span>
              <strong>
                {projects.filter(
                  (p) =>
                    p.health === "At Risk" || p.health === "Critical"
                ).length}
              </strong>
            </div>

            <div className="faculty-stat-card">
              <span>Blocked Projects</span>
              <strong>
                {projects.filter((p) => getBlockers(p).length > 0).length}
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
                        <td>{project.student_name || "Not provided"}</td>
                        <td>{project.status || "Not Started"}</td>
                        <td>{project.progress ?? 0}%</td>
                        <td>{project.health || "Not available"}</td>
                        <td>{getRisks(project).length}</td>
                        <td>{getBlockers(project).length}</td>
                        <td>
                          <button
                            className="faculty-view-button"
                            onClick={() => setSelectedProject(project)}
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
                  Student: {selectedProject.student_name || "Not provided"}
                </p>
                <p>
                  Description: {selectedProject.description || "Not available"}
                </p>
                <p>Status: {selectedProject.status || "Not available"}</p>
                <p>Progress: {selectedProject.progress ?? 0}%</p>
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
                      <li key={index}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No blockers available.</p>
                )}

                <h3>AI-Generated Summary</h3>
                <p>
                  {selectedProject.ai_summary ||
                    selectedProject.ai_analysis?.summary ||
                    "AI-generated summary will appear when project data is connected."}
                </p>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;