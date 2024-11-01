import * as z from 'zod'

export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  email: z.optional(z.string().email()),
  password: z.optional(z.string().min(6)),
  role: z
    .enum(['Admin', 'Supervisor', 'Employee'], {
      invalid_type_error: 'Invalid role selected'
    })
    .default('Employee'),
  isTwoFactorEnabled: z.optional(z.boolean())
})

// Create a type to track form state changes
export interface FormChanges {
  is2FAToggled: boolean
  originalValues: {
    isTwoFactorEnabled: boolean
  }
}
