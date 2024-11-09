import { relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

// Enums using pgEnum for type safety and validation
export const UserRole = { ADMIN: 'Admin', SUPERVISOR: 'Supervisor', EMPLOYEE: 'Employee' } as const
export const userRoleEnum = pgEnum('role', [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.EMPLOYEE])
export const clientStatus = { ACTIVE: 'active', DEACTIVE: 'deactive' } as const
export const clientStatusEnum = pgEnum('client_status', [
  clientStatus.ACTIVE,
  clientStatus.DEACTIVE
])
export const projectStatus = { ACTIVE: 'active', DEACTIVE: 'deactive' } as const
export const projectStatusEnum = pgEnum('project_status', [
  projectStatus.ACTIVE,
  projectStatus.DEACTIVE
])

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const
export const taskStatusEnum = pgEnum('task_status', [
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED
])
export const themeEnum = pgEnum('theme', ['light', 'dark'])
export const languageEnum = pgEnum('language', ['en', 'ar'])

// User Types
export type User = typeof users.$inferSelect
export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type UserSession = {
  id: User['id']
  name: User['name']
  email: User['email']
  role: UserRole
  image: User['image']
  isTwoFactorEnabled: User['isTwoFactorEnabled']
} & Partial<UserPreferences>
export type UserPreferences = typeof userPreferences.$inferSelect

// Client Types
export type Client = typeof clients.$inferSelect

// Project Types
export type Project = typeof projects.$inferSelect
export type ExtendedProject = Project & {
  assignedEmployeeName: User['name']
  clientName: Client['name']
}

// Task Types
export type Task = typeof tasks.$inferSelect
export type TasksByStatus = {
  pending: Task[]
  'in-progress': Task[]
  completed: Task[]
}

export type Event = typeof events.$inferSelect

// Auth Tables with corrected column names for NextAuth
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  hashedPassword: text('hashed_password'),
  role: userRoleEnum('role').notNull().default('Employee'),
  image: text('image').notNull(),
  isTwoFactorEnabled: boolean('is_two_factor_enabled').notNull().default(false),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  suspendedAt: timestamp('suspended_at', { mode: 'date' })
})

export const userPreferences = pgTable('user_preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: themeEnum('theme').default('light'),
  language: languageEnum('language').notNull().default('en')
})

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  role: userRoleEnum('role').default('Employee')
})

export const VerificationToken = pgTable(
  'verification_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires').notNull()
  },
  table => ({ verificationTokenIdx: unique('verification_token_idx').on(table.email, table.token) })
)

export const PasswordResetToken = pgTable(
  'password_reset_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires').notNull()
  },
  table => ({
    passwordResetTokenIdx: unique('password_reset_token_idx').on(table.email, table.token)
  })
)

export const TwoFactorToken = pgTable(
  'two_factor_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires').notNull()
  },
  table => ({ twoFactorTokenIdx: unique('two_factor_token_idx').on(table.email, table.token) })
)

export const twoFactorConfirmations = pgTable(
  'two_factor_confirmations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  table => ({
    twoFactorConfirmationUserIdx: unique('two_factor_confirmation_user_idx').on(table.userId)
  })
)

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  description: text('description').notNull(),
  userName: text('user_name').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  userRole: userRoleEnum('role').notNull().default('Employee'),
  timestamp: timestamp('timestamp', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date())
})

// Core Schema
export const clients = pgTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  status: clientStatusEnum('status').notNull().default('active'),
  assignedEmployeeId: text('assigned_employee_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' })
})

export const projects = pgTable('projects', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  assignedEmployeeId: text('assigned_employee_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  status: projectStatusEnum('status').default('active'),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' })
})

export const tasks = pgTable('tasks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }).notNull(),
  status: taskStatusEnum('status').default('pending').notNull(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  assignedEmployeeId: text('assigned_employee_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' })
})

/**
 * Define relations for the twoFactorConfirmations table
 * @example
 * ```ts
 * const twoFactorWithUser = await db.query.twoFactorConfirmations.findFirst({
 *  with: { user: true }})
 */
export const twoFactorConfirmationsRelations = relations(twoFactorConfirmations, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorConfirmations.userId],
    references: [users.id]
  })
}))

/**
 * Define relations for the userPreferences table
 * @example
 * ```ts
 * const userPreferencesWithUser = await db.query.userPreferences.findFirst({
 *  with: { user: true }})
 */
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] })
}))

/**
 * Define relations for the users table with twoFactorConfirmations and userPreferences
 * @example
 * ```ts
 * const userWithTwoFactor = await db.query.users.findFirst({
 *  with: { twoFactorConfirmations: true,  preferences: true }
 * })
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  twoFactorConfirmations: many(twoFactorConfirmations),
  preferences: one(userPreferences),
  events: many(events)
}))

// Relation between projects and users
export const projectsRelations = relations(projects, ({ one }) => ({
  assignedEmployee: one(users, { fields: [projects.assignedEmployeeId], references: [users.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] })
}))

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] })
}))
