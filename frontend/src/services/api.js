// import { project, stats, skills, milestones, timeline, pendingTasks } from "../data/mockData.js";

// export function getProject() {
//   return project;
// }

// export function getStats() {
//   return stats;
// }

// export function getPendingTasks() {
//   return pendingTasks;
// }

// export function getSkills() {
//   return skills;
// }

// export function getMilestones() {
//   return milestones;
// }

// export function getMilestoneById(id) {
//   return milestones.find((m) => m.id === Number(id));
// }

// export function getTimeline() {
//   return timeline;
// }

// export function getTimelineSummary() {
//   const total = timeline.length;
//   const completed = timeline.filter((w) => w.status === "Completed").length;
//   const inProgress = timeline.filter((w) => w.status === "In Progress").length;
//   const atRisk = timeline.filter((w) => w.status === "At Risk").length;
//   return { total, completed, inProgress, atRisk };
// }

// export function getSkillSummary() {
//   let total = 0;
//   let count = 0;
//   skills.categories.forEach((cat) => {
//     cat.skills.forEach((s) => {
//       total += s.level;
//       count += 1;
//     });
//   });
//   return { average: Math.round(total / count), count };
// }


import {
  project,
  stats,
  skills,
  milestones,
  timeline,
  pendingTasks,
} from "../data/mockData.js";

// Backend API base URL
const API_BASE_URL = "http://127.0.0.1:8000";

// -----------------------------------------------------------------------------
// Existing mock-data functions
// -----------------------------------------------------------------------------

export function getProject() {
  return project;
}

export function getStats() {
  return stats;
}

export function getPendingTasks() {
  return pendingTasks;
}

export function getSkills() {
  return skills;
}

export function getMilestones() {
  return milestones;
}

export function getMilestoneById(id) {
  return milestones.find((m) => m.id === Number(id));
}

export function getTimeline() {
  return timeline;
}

export function getTimelineSummary() {
  const total = timeline.length;
  const completed = timeline.filter(
    (w) => w.status === "Completed"
  ).length;
  const inProgress = timeline.filter(
    (w) => w.status === "In Progress"
  ).length;
  const atRisk = timeline.filter(
    (w) => w.status === "At Risk"
  ).length;

  return {
    total,
    completed,
    inProgress,
    atRisk,
  };
}

export function getSkillSummary() {
  let total = 0;
  let count = 0;

  skills.categories.forEach((cat) => {
    cat.skills.forEach((s) => {
      total += s.level;
      count += 1;
    });
  });

  return {
    average: count > 0 ? Math.round(total / count) : 0,
    count,
  };
}

// -----------------------------------------------------------------------------
// Student Skill Assessment API
// -----------------------------------------------------------------------------

export async function getSkillAssessment(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/skills/${studentId}`
  );

  if (!response.ok) {
    let errorMessage = "Failed to load skill assessment.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep the default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function updateSkillAssessment(studentId, data) {
  const response = await fetch(
    `${API_BASE_URL}/skills/${studentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to update skill assessment.";

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep the default error message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}