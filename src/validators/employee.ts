import { z } from 'zod'

export const employeeSchema = z.object({
  // System Employee Info validations
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z
    .enum(['admin', 'employee'], {
      invalid_type_error: 'Invalid role selected'
    })
    .default('employee'),

  // Personal Employee Info validations
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  nationality: z
    .string()
    .min(2, 'Nationality must be at least 2 characters')
    .max(50, 'Nationality cannot exceed 50 characters'),
  startWorkingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  finalWorkingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional()
    .nullable(),
  contractEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional()
    .nullable(),
  residencyEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional()
    .nullable(),
  personalIdNumber: z
    .string()
    .regex(/^\d+$/, 'Personal ID must contain only numbers')
    .transform(val => parseInt(val)),
  passportIdNumber: z
    .string()
    .min(5, 'Passport ID must be at least 5 characters')
    .max(20, 'Passport ID cannot exceed 20 characters'),
  salaryAmount: z
    .number()
    .min(0, 'Salary cannot be negative')
    .max(1000000, 'Salary amount exceeds maximum limit'),
  comissionPercentage: z
    .number()
    .min(0, 'Commission cannot be negative')
    .max(100, 'Commission percentage cannot exceed 100')
    .default(0)
})

// You can also export the type
export type EmployeeSchemaType = z.infer<typeof employeeSchema>
