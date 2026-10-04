import React, { useState } from "react";
import IntegratedLayout from "../components/IntegratedLayout";

const API_BASE_URL = "http://127.0.0.1:8000";

const DOCUMENT_TYPES = [
  {
    value: "synopsis",
    label: "Synopsis",
    description: "Generate an academic project synopsis."
  },
  {
    value: "methodology",
    label: "Methodology",
    description: "Generate the project methodology document."
  },
  {
    value: "progress_report",
    label: "Progress Report",
    description: "Generate a report based on recorded project progress."
  }
];

const Documents = () => {
  const [documentType, setDocumentType] = useState("synopsis");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getProjectId = () => {
    return (
      localStorage.getItem("activeProjectId") ||
      sessionStorage.getItem("activeProjectId")
    );
  };

  const handleGenerate = async () => {
    const projectId = getProjectId();

    if (!projectId) {
      setError("No active project found. Please select a project first.");
      setContent("");
      return;
    }

    setLoading(true);
    setError("");
    setContent("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai/generate-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id: projectId,
            document_type: documentType
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Document generation failed."
        );
      }

      setContent(data.content || "No document content was returned.");
    } catch (err) {
      setError(
        err.message || "Unable to generate the document."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IntegratedLayout>
      <div
        style={{
          padding: "24px",
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              color: "#1e293b"
            }}
          >
            Project Documents
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            Generate academic documents using your project information,
            milestones, risks, and progress.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px"
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "8px"
            }}
          >
            Document Type
          </label>

          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#ffffff"
            }}
          >
            {DOCUMENT_TYPES.map((document) => (
              <option
                key={document.value}
                value={document.value}
              >
                {document.label}
              </option>
            ))}
          </select>

          <p
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "#64748b"
            }}
          >
            {
              DOCUMENT_TYPES.find(
                (document) =>
                  document.value === documentType
              )?.description
            }
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer"
            }}
          >
            {loading
              ? "Generating..."
              : "Generate Document"}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "16px",
              marginBottom: "24px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c"
            }}
          >
            {error}
          </div>
        )}

        {content && (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  color: "#1e293b"
                }}
              >
                Generated Document
              </h2>
            </div>

            <div
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.7",
                color: "#334155",
                fontSize: "15px"
              }}
            >
              {content}
            </div>
          </div>
        )}
      </div>
    </IntegratedLayout>
  );
};

export default Documents;