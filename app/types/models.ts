export type TaskType = 'homework' | 'report' | 'research_progress';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'paused' | 'completed';

export interface Subject {
  id: number;
  name: string;
  code: string | null;
  color: string | null;
  userEmail: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  targetCompletionDate: number | null;
  userEmail: string;
  createdAt: string;
}

export interface Task {
  id: number;
  userEmail: string;
  subjectId: number | null;
  projectId: number | null;
  type: TaskType;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: number | null;
  recurrenceRule: string | null;
  estimatedMinutes: number | null;
  actualMinutes: number;
  createdAt: string;
  updatedAt: string;
  /** 繰り返しタスクの「今週完了済みか」（API の一覧・ダッシュボードで付与） */
  completedThisWeek?: boolean;
}

export interface ProgressLog {
  id: number;
  projectId: number;
  content: string;
  progressPercent: number;
  loggedAt: string;
}

export interface DashboardData {
  todayTasks: Task[];
  overdueTasks: Task[];
  upcomingReports: Task[];
  weeklyHomework: Task[];
  activeProjects: Project[];
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProjectDetail {
  project: Project;
  progressLogs: ProgressLog[];
  tasks: Task[];
}

// 作成・更新用の入力型

export interface SubjectInput {
  name: string;
  code?: string | null;
  color?: string | null;
}

export interface ProjectInput {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  targetCompletionDate?: number | null;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  type: TaskType;
  subjectId?: number | null;
  projectId?: number | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: number | null;
  recurrenceRule?: string | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
}

export interface ProgressLogInput {
  content: string;
  progressPercent?: number;
}
