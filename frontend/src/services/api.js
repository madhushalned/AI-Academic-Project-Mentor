const API_BASE_URL = "http://127.0.0.1:8000";

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.detail || `Request failed with HTTP ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getStudent(studentId) {
  if (!studentId) {
    return Promise.reject(new Error("Student ID is required."));
  }

  return requestJson(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}`
  );
}

export function updateStudent(studentId, data) {
  if (!studentId) {
    return Promise.reject(new Error("Student ID is required."));
  }

  return requestJson(
    `${API_BASE_URL}/students/${encodeURIComponent(studentId)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function getSkillAssessment(studentId) {
  if (!studentId) {
    return Promise.reject(new Error("Student ID is required."));
  }

  return requestJson(
    `${API_BASE_URL}/skills/${encodeURIComponent(studentId)}`
  );
}

export function updateSkillAssessment(studentId, assessment) {
  if (!studentId) {
    return Promise.reject(new Error("Student ID is required."));
  }

  return requestJson(
    `${API_BASE_URL}/skills/${encodeURIComponent(studentId)}`,
    {
      method: "PUT",
      body: JSON.stringify(assessment),
    }
  );
}