import { z } from 'zod'
import { TaskStatus, taskStatusEnum } from '@/db/schema'

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  dueDate: z.coerce
    .date()
    .min(new Date('2000-01-01'), 'Due date too far in the past')
    .max(new Date('2100-01-01'), 'Due date too far in the future'),
  status: z.enum(taskStatusEnum.enumValues, {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status selected'
  }),
  files: z.array(z.string()).optional()
})

export type TaskSchemaType = z.infer<typeof taskSchema>

// Helper function to get initial form values
export const getInitialProjectValues = (): TaskSchemaType => ({
  title: '',
  description: '',
  dueDate: new Date(),
  status: TaskStatus.PENDING,
  files: []
})
