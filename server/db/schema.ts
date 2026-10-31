import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  email: text('email').primaryKey(),
  displayName: text('display_name'),
  identityId: text('identity_id').unique(),
  createdAt: text('created_at').notNull(),
});

export const subjects = sqliteTable('subjects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code'),
  color: text('color'),
  userEmail: text('user_email')
    .notNull()
    .references(() => users.email),
  createdAt: text('created_at').notNull(),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['active', 'paused', 'completed'] })
    .notNull()
    .default('active'),
  targetCompletionDate: integer('target_completion_date'),
  userEmail: text('user_email')
    .notNull()
    .references(() => users.email),
  createdAt: text('created_at').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userEmail: text('user_email')
    .notNull()
    .references(() => users.email),
  subjectId: integer('subject_id').references(() => subjects.id),
  projectId: integer('project_id').references(() => projects.id),
  type: text('type', {
    enum: ['homework', 'report', 'research_progress'],
  }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['not_started', 'in_progress', 'completed', 'archived'],
  })
    .notNull()
    .default('not_started'),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'urgent'],
  })
    .notNull()
    .default('medium'),
  dueDate: integer('due_date'),
  recurrenceRule: text('recurrence_rule'),
  estimatedMinutes: integer('estimated_minutes'),
  actualMinutes: integer('actual_minutes').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const progressLogs = sqliteTable('progress_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id),
  content: text('content').notNull(),
  progressPercent: integer('progress_percent').default(0),
  loggedAt: text('logged_at').notNull(),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'),
  userEmail: text('user_email')
    .notNull()
    .references(() => users.email),
});

export const taskTags = sqliteTable('task_tags', {
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id),
});

export const taskCompletions = sqliteTable('task_completions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id),
  completedDate: integer('completed_date').notNull(),
  createdAt: text('created_at').notNull(),
});
