export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Proficiency = 0 | 1 | 2 | 3 | 4 | 5;

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'at_risk';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type Priority = 'low' | 'medium' | 'high';
export type WeekStatus = 'upcoming' | 'in_progress' | 'completed' | 'at_risk';

export interface StudentInfo {
  name: string;
  department: string;
  year: string;
  academicLevel: string;
  email: string;
  avatarInitials: string;
}

export interface SkillRating {
  name: string;
  level: SkillLevel;
  proficiency: Proficiency;
  selected: boolean;
}

export interface SkillGroup {
  id: string;
  title: string;
  icon: string;
  skills: SkillRating[];
}

export interface SkillAssessment {
  student: StudentInfo;
  groups: SkillGroup[];
  completion: number;
  saved: boolean;
  lastUpdated: string;
}

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  dueDate: string;
  priority: Priority;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  startDate: string;
  endDate: string;
  status: MilestoneStatus;
  progress: number;
  priority: Priority;
  tasks: Task[];
  notes: string;
}

export interface TimelineWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  milestoneId: string;
  milestoneTitle: string;
  tasks: string[];
  progress: number;
  status: WeekStatus;
}

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  startDate: string;
  expectedCompletion: string;
  currentWeek: number;
  totalWeeks: number;
  overallProgress: number;
  student: StudentInfo;
}
