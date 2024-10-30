import { z } from 'zod'

export const userSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email cannot exceed 100 characters'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter'),

  role: z
    .enum(['Admin', 'Supervisor', 'Employee'], {
      invalid_type_error: 'Invalid role selected'
    })
    .default('Employee'),

  image: z.string().url('Please enter a valid URL for the image')
})

// Export the type for use in components
export type UserSchemaType = z.infer<typeof userSchema>
