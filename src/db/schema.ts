import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Enums using pgEnum for type safety and validation
export const userRoleEnum = pgEnum('role', ['Admin', 'Supervisor', 'Employee'])
export const clientStatusEnum = pgEnum('client_status', ['active', 'inactive'])
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in-progress', 'completed'])

type User = typeof users.$inferSelect
export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type UserSession = {
  id: User['id']
  name: User['name']
  email: User['email']
  role: UserRole
  image: User['image']
}

// Auth Tables with corrected column names for NextAuth
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  hashedPassword: text('hashed_password'),
  role: userRoleEnum('role').default('Employee'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image').notNull()
})

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  role: userRoleEnum('role').default('Employee')
})

// Core Schema
export const clients = pgTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  status: clientStatusEnum('status').default('active'),
  assignedEmployeeId: text('assigned_employee_id').references(() => users.id, {
    onDelete: 'set null'
  })
})

export const tasks = pgTable('tasks', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { mode: 'date' }), // useful for CRM tasks
  status: taskStatusEnum('status').default('pending'),
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }), // ensures client-tasks link
  assignedToUserId: text('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }) // sets null if user removed
})
