import { integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

// Enums using pgEnum for type safety and validation
export const userRoleEnum = pgEnum('user_role', ['Admin', 'Supervisor', 'Employee'])
export const clientStatusEnum = pgEnum('client_status', ['active', 'inactive'])
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in-progress', 'completed'])

export type UserRole = (typeof userRoleEnum.enumValues)[number]

// Auth Tables with corrected column names for NextAuth
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  hashedPassword: text('hashed_password'),
  userRole: userRoleEnum('user_role')
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state')
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  userRole: userRoleEnum('user_role') // Caching role for active session for consistency
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
  })
)

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
