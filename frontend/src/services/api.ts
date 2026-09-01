import type {
  ProjectInfo,
  Milestone,
  TimelineWeek,
  SkillAssessment,
} from '@/types';
import {
  projectInfo as mockProject,
  milestones as mockMilestones,
  timelineWeeks as mockTimeline,
  initialSkillAssessment as mockAssessment,
} from '@/data/mockData';

/**
 * API service layer.
 *
 * Currently returns mock data. When the FastAPI backend is ready, replace the
 * mock fetches below with real HTTP calls. The function signatures are designed
 * to match the planned REST endpoints:
 *
 *   GET    /students/{id}/skills           -> getSkillAssessment
 *   POST   /students/{id}/skills           -> saveSkillAssessment
 *   GET    /projects/{id}                  -> getProject
 *   GET    /projects/{id}/milestones       -> getMilestones
 *   PUT    /milestones/{id}                -> updateMilestone
 *   GET    /projects/{id}/timeline         -> getTimeline
 */

const STUDENT_ID = 'stu-001';
const PROJECT_ID = mockProject.id;

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

function delay<T>(data: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const api = {
  getProject(): Promise<ProjectInfo> {
    // GET /projects/{PROJECT_ID}
    return delay(mockProject);
  },

  getMilestones(): Promise<Milestone[]> {
    // GET /projects/{PROJECT_ID}/milestones
    return delay(mockMilestones);
  },

  updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    // PUT /milestones/{id}
    const existing = mockMilestones.find((m) => m.id === id);
    if (!existing) return Promise.reject(new Error('Milestone not found'));
    return delay({ ...existing, ...updates });
  },

  getTimeline(): Promise<TimelineWeek[]> {
    // GET /projects/{PROJECT_ID}/timeline
    return delay(mockTimeline);
  },

  getSkillAssessment(): Promise<SkillAssessment> {
    // GET /students/{STUDENT_ID}/skills
    return delay(mockAssessment);
  },

  saveSkillAssessment(assessment: SkillAssessment): Promise<SkillAssessment> {
    // POST /students/{STUDENT_ID}/skills
    return delay({ ...assessment, saved: true, lastUpdated: new Date().toISOString() });
  },
};

export { STUDENT_ID, PROJECT_ID };
