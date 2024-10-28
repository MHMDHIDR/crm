import { relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, real, text, timestamp } from 'drizzle-orm/pg-core'

// Auth Tables with corrected column names for NextAuth they must be named with underscores
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image')
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull()
})

export const verificationTokens = pgTable(
  'verificationToken', // Changed from 'verificationTokens' to match NextAuth expectation
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  vt => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
  })
)

// Updated tables with UUID generation for IDs
export const clients = pgTable('clients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  employeeId: text('employeeId').references(() => personalEmployeeInfo.id),
  clientName: text('clientName'),
  createdAt: timestamp('createdAt').defaultNow(),
  nationality: text('nationality'),
  phoneNumber: integer('phoneNumber'),
  email: text('email'),
  jobTitle: text('jobTitle'),
  officeDiscoveryMethod: text('officeDiscoveryMethod'),
  customerCredentials: text('customerCredentials')
})

export const expenses = pgTable('expenses', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  amount: integer('amount').notNull(),
  expenseName: text('expenseName').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull()
})

export const officeDetails = pgTable('officeDetails', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  arOfficeName: text('arOfficeName'),
  enOfficeName: text('enOfficeName'),
  arOfficeAddress: text('arOfficeAddress'),
  enOfficeAddress: text('enOfficeAddress'),
  officePhone: text('officePhone'),
  officeEmail: text('officeEmail'),
  officeTaxNumber: text('officeTaxNumber')
})

export const personalEmployeeInfo = pgTable('personalEmployeeInfo', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fullName: text('fullName').notNull(),
  nationality: text('nationality').notNull(),
  startWorkingDate: timestamp('startWorkingDate').notNull(),
  finalWorkingDate: timestamp('finalWorkingDate'),
  contractEndDate: timestamp('contractEndDate'),
  residencyEndDate: timestamp('residencyEndDate'),
  personalIdNumber: integer('personalIdNumber').notNull(),
  passportIdNumber: text('passportIdNumber'),
  salaryAmount: real('salaryAmount').notNull(),
  comissionPercentage: integer('comissionPercentage').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow()
})

export const systemEmployeeInfo = pgTable('systemEmployeeInfo', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  employeeId: text('employeeId').references(() => personalEmployeeInfo.id),
  username: text('username'),
  password: text('password'),
  role: text('role').default('employee').notNull(),
  loginTime: timestamp('loginTime'),
  logoutTime: timestamp('logoutTime')
})

export const receipts = pgTable('receipts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  serviceId: text('serviceId').references(() => services.id, { onDelete: 'cascade' }),
  clientId: text('clientId').references(() => clients.id, { onDelete: 'cascade' }),
  employeeId: text('employeeId').references(() => personalEmployeeInfo.id, {
    onDelete: 'cascade'
  }),
  servicePaidAmount: real('servicePaidAmount'),
  serviceRemainingAmount: real('serviceRemainingAmount').notNull(),
  createdAt: timestamp('createdAt').defaultNow()
})

export const services = pgTable('services', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  employeeId: text('employeeId')
    .notNull()
    .references(() => personalEmployeeInfo.id, { onDelete: 'cascade' }),
  clientId: text('clientId')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  representativeId: text('representativeId'),
  serviceName: text('serviceName').notNull(),
  serviceTotalPrice: integer('serviceTotalPrice').notNull(),
  servicePaymentStatus: text('servicePaymentStatus').default('unpaid').notNull(),
  serviceStatus: text('serviceStatus').default('notStarted').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  endsAt: timestamp('endsAt').notNull(),
  serviceDetails: text('serviceDetails'),
  subServices: text('subServices')
})

// Relations
export const clientsRelations = relations(clients, ({ one }) => ({
  employee: one(personalEmployeeInfo, {
    fields: [clients.employeeId],
    references: [personalEmployeeInfo.id]
  })
}))

export const servicesRelations = relations(services, ({ one }) => ({
  employee: one(personalEmployeeInfo, {
    fields: [services.employeeId],
    references: [personalEmployeeInfo.id]
  }),
  client: one(clients, {
    fields: [services.clientId],
    references: [clients.id]
  })
}))

export const receiptsRelations = relations(receipts, ({ one }) => ({
  service: one(services, {
    fields: [receipts.serviceId],
    references: [services.id]
  }),
  client: one(clients, {
    fields: [receipts.clientId],
    references: [clients.id]
  }),
  employee: one(personalEmployeeInfo, {
    fields: [receipts.employeeId],
    references: [personalEmployeeInfo.id]
  })
}))

export const systemEmployeeInfoRelations = relations(systemEmployeeInfo, ({ one }) => ({
  employee: one(personalEmployeeInfo, {
    fields: [systemEmployeeInfo.employeeId],
    references: [personalEmployeeInfo.id]
  })
}))
