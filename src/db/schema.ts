import { relations } from 'drizzle-orm'
import { boolean, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

// Enums using pgEnum for type safety and validation
export const UserRole = { ADMIN: 'Admin', SUPERVISOR: 'Supervisor', EMPLOYEE: 'Employee' } as const
export const userRoleEnum = pgEnum('role', [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.EMPLOYEE])
export const clientStatusEnum = pgEnum('client_status', ['active', 'inactive'])
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in-progress', 'completed'])

export type User = typeof users.$inferSelect
export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type UserSession = {
  id: User['id']
  name: User['name']
  email: User['email']
  role: UserRole
  image: User['image']
  isTwoFactorEnabled: User['isTwoFactorEnabled']
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
  isTwoFactorEnabled: boolean('is_two_factor_enabled').default(false),
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
 * Define relations for the users table
 * @example
 * ```ts
 * const userWithTwoFactor = await db.query.users.findFirst({
 *  with: { twoFactorConfirmations: true }})
 */
export const usersRelations = relations(users, ({ many }) => ({
  twoFactorConfirmations: many(twoFactorConfirmations)
}))
