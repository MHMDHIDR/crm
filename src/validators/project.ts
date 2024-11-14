import { z } from 'zod'

// First, let's define the project status enum to match your database
export const ProjectStatus = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated'
} as const

// Create the base schema without refinements
const baseProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),

  description: z.string().max(2000, 'Description cannot exceed 2000 characters').trim().optional(),

  clientId: z.string().min(1, 'Please Select the Client as it is required'),

  startDate: z.coerce
    .date()
    .min(new Date('2000-01-01'), 'Date too far in the past')
    .max(new Date('2100-01-01'), 'Date too far in the future')
    .refine(date => {
      return date instanceof Date && !isNaN(date.getTime())
    }, 'Invalid date format')
    .optional(),
  endDate: z.coerce
    .date()
    .min(new Date('2000-01-01'), 'Date too far in the past')
    .max(new Date('2100-01-01'), 'Date too far in the future')
    .refine(date => {
      return date instanceof Date && !isNaN(date.getTime())
    }, 'Invalid date format')
    .optional(),

  status: z.enum([ProjectStatus.ACTIVE, ProjectStatus.DEACTIVATED], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status selected'
  })
})

// Create partial schema for updates (without date validation)
export const projectUpdateSchema = baseProjectSchema.partial()

// Add the refinement for date validation to the create schema
export const projectSchema = baseProjectSchema.refine(
  data => {
    // Only validate end date if both dates are present
    if (data.endDate && data.startDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be on or after the start date',
    path: ['endDate'] // This will make the error show up on the endDate field
  }
)

// Schema for creating a new project (keeping required fields)
export const projectCreateSchema = projectSchema

// Export types for use in components
export type ProjectSchemaType = z.infer<typeof projectSchema>
export type ProjectUpdateSchemaType = z.infer<typeof projectUpdateSchema>
export type ProjectCreateSchemaType = z.infer<typeof projectCreateSchema>

// Helper function to get initial form values
export const getInitialProjectValues = (): ProjectCreateSchemaType => ({
  name: '',
  description: '',
  clientId: '',
  startDate: undefined,
  endDate: undefined,
  status: ProjectStatus.ACTIVE
})
