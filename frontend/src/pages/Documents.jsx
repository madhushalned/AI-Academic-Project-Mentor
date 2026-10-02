import React, { useState } from "react";
import { jsPDF } from "jspdf";
import Sidebar from "../common/sidebar";
import Header from "../common/header";
import "./Documents.css";

const API_BASE_URL = "http://127.0.0.1:8000";

/*
 *  backend teammate
 * Replace the empty strings with the actual routes.
 */
const DOCUMENT_API = {
  synopsis: "",
  methodology: "",
  progress: "",
};

const Documents = ({ projects = [] }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    setSelectedDocument(null);
    setError("");
  };

  const getProject = () => {
    return projects.find(
      (project) =>
        String(project.project_id || project.id) ===
        String(selectedProject)
    );
  };

  const getTitle = (type) => {
    if (type === "synopsis") {
      return "Project Synopsis";
    }

    if (type === "methodology") {
      return "Project Methodology";
    }

    if (type === "progress") {
      return "Project Progress Report";
    }

    return "Generated Document";
  };

  const handleGenerate = async (type) => {
    if (!selectedProject) {
      setError("Please select a project first.");
      return;
    }

    if (!DOCUMENT_API[type]) {
      setError(
        "The backend endpoint for this document has not been added yet."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSelectedDocument(null);

      const response = await fetch(
        `${API_BASE_URL}${DOCUMENT_API[type]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: selectedProject,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate document."
        );
      }

      setSelectedDocument({
        type,
        title: getTitle(type),
        content: data,
      });
    } catch (err) {
      console.error("Document generation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedDocument) {
      handleGenerate(selectedDocument.type);
    }
  };

  const getContent = () => {
    if (!selectedDocument) {
      return null;
    }

    const data = selectedDocument.content;

    return (
      data.content ||
      data.document ||
      data.generated_content ||
      data.generated_document ||
      data
    );
  };

  const renderContent = (content) => {
    if (!content) {
      return (
        <p>
          No document content was returned.
        </p>
      );
    }

    if (typeof content === "string") {
      return <p>{content}</p>;
    }

    if (Array.isArray(content)) {
      return content.map((section, index) => (
        <div
          className="document-section"
          key={index}
        >
          {section.title && (
            <h3>{section.title}</h3>
          )}

          <p>
            {typeof section.content === "string"
              ? section.content
              : JSON.stringify(
                  section.content
                )}
          </p>
        </div>
      ));
    }

    if (
      content.sections &&
      Array.isArray(content.sections)
    ) {
      return content.sections.map(
        (section, index) => (
          <div
            className="document-section"
            key={index}
          >
            <h3>{section.title}</h3>

            <p>
              {typeof section.content ===
              "string"
                ? section.content
                : JSON.stringify(
                    section.content
                  )}
            </p>
          </div>
        )
      );
    }

    return (
      <pre className="document-json">
        {JSON.stringify(
          content,
          null,
          2
        )}
      </pre>
    );
  };

  const downloadPDF = () => {
    if (!selectedDocument) {
      return;
    }

    const pdf = new jsPDF();

    const project = getProject();

    let y = 20;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");

    pdf.text(
      selectedDocument.title,
      20,
      y
    );

    y += 12;

    if (project) {
      pdf.setFontSize(12);
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        `Project: ${project.title}`,
        20,
        y
      );

      y += 15;
    }

    let content = getContent();

    if (typeof content !== "string") {
      content = JSON.stringify(
        content,
        null,
        2
      );
    }

    const lines =
      pdf.splitTextToSize(
        content,
        170
      );

    lines.forEach((line) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(11);
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        line,
        20,
        y
      );

      y += 6;
    });

    const projectName =
      project?.title || "project";

    pdf.save(
      `${projectName}-${selectedDocument.type}.pdf`
    );
  };

  const project = getProject();

  return (
    <div className="documents-page">
      <Sidebar />

      <div className="documents-main">
        <Header />

        <main className="documents-content">
          <div className="documents-heading">
            <h1>Documents</h1>

            <p>
              Generate documents for your academic
              project.
            </p>
          </div>

          {/* PROJECT */}

          <section className="project-selection-card">
            <div className="project-selection-header">
              <h2>Select Project</h2>

              <p>
                Select the project for which you want
                to generate a document.
              </p>
            </div>

            <div className="project-selection">
              <label htmlFor="project">
                Project
              </label>

              <select
                id="project"
                value={selectedProject}
                onChange={handleProjectChange}
              >
                <option value="">
                  Select a project
                </option>

                {projects.map((item) => (
                  <option
                    key={
                      item.project_id ||
                      item.id
                    }
                    value={
                      item.project_id ||
                      item.id
                    }
                  >
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* GENERATE */}

          <section className="document-generator-card">
            <div className="generator-header">
              <h2>Generate Document</h2>

              <p>
                Choose the document you want to
                generate.
              </p>
            </div>

            <div className="document-buttons">
              <button
                type="button"
                className="document-type-btn"
                disabled={
                  !selectedProject ||
                  loading
                }
                onClick={() =>
                  handleGenerate("synopsis")
                }
              >
                <span className="document-btn-title">
                  Generate Synopsis
                </span>

                <span className="document-btn-description">
                  Generate the project synopsis.
                </span>
              </button>

              <button
                type="button"
                className="document-type-btn"
                disabled={
                  !selectedProject ||
                  loading
                }
                onClick={() =>
                  handleGenerate(
                    "methodology"
                  )
                }
              >
                <span className="document-btn-title">
                  Generate Methodology
                </span>

                <span className="document-btn-description">
                  Generate the project methodology.
                </span>
              </button>

              <button
                type="button"
                className="document-type-btn"
                disabled={
                  !selectedProject ||
                  loading
                }
                onClick={() =>
                  handleGenerate("progress")
                }
              >
                <span className="document-btn-title">
                  Generate Progress Report
                </span>

                <span className="document-btn-description">
                  Generate the project progress report.
                </span>
              </button>
            </div>

            {loading && (
              <p className="loading-message">
                Generating document...
              </p>
            )}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}
          </section>

          {/* PREVIEW */}

          <section className="document-preview-card">
            <div className="preview-header">
              <div>
                <h2>
                  {selectedDocument
                    ? selectedDocument.title
                    : "Generated Document"}
                </h2>

                <p>
                  {project
                    ? `Project: ${project.title}`
                    : "Generated document content will appear here."}
                </p>
              </div>

              {selectedDocument && (
                <div className="document-actions">
                  <button
                    type="button"
                    className="regenerate-btn"
                    onClick={handleRegenerate}
                    disabled={loading}
                  >
                    Regenerate
                  </button>

                  <button
                    type="button"
                    className="download-btn"
                    onClick={downloadPDF}
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            {!selectedDocument ? (
              <div className="empty-document-state">
                

                <h3>
                  No document generated
                </h3>

                <p>
                  Select a project and generate a
                  document to see the result here.
                </p>
              </div>
            ) : (
              <div className="document-preview">
                {project && (
                  <div className="selected-project-info">
                    <span>
                      Selected Project
                    </span>

                    <strong>
                      {project.title}
                    </strong>
                  </div>
                )}

                {renderContent(
                  getContent()
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Documents;