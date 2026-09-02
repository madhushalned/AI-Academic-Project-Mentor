import { project, stats, skills, milestones, timeline, pendingTasks } from "../data/mockData.js";

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
  const completed = timeline.filter((w) => w.status === "Completed").length;
  const inProgress = timeline.filter((w) => w.status === "In Progress").length;
  const atRisk = timeline.filter((w) => w.status === "At Risk").length;
  return { total, completed, inProgress, atRisk };
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
  return { average: Math.round(total / count), count };
}
