import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email cannot exceed 100 characters'),

  phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number' }),

  status: z.enum(['active', 'deactivated'], {
    invalid_type_error: 'Invalid status selected'
  })
})

// Export the type for use in components
export type ClientSchemaType = z.infer<typeof clientSchema>
