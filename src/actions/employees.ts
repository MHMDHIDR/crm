'use server'

import { hash } from 'crypto'
import { z } from 'zod'
import { signIn } from '@/auth'
import { database } from '@/db'
import { personalEmployeeInfo, systemEmployeeInfo } from '@/db/schema'
import { EmployeeRequestBody } from '@/types'
import { employeeSchema } from '@/validators/employee'

export async function createEmployee(formData: FormData) {
  const createEmployeeData = {
    username: (formData.get('username') as string) || '',
    password: (formData.get('password') as string) || '',
    role: (formData.get('role') as string) || '',
    fullName: (formData.get('fullName') as string) || '',
    nationality: (formData.get('nationality') as string) || '',
    startWorkingDate: (formData.get('startWorkingDate') as string) || '',
    finalWorkingDate: (formData.get('finalWorkingDate') as string) || '',
    contractEndDate: (formData.get('contractEndDate') as string) || '',
    residencyEndDate: (formData.get('residencyEndDate') as string) || '',
    personalIdNumber: (formData.get('personalIdNumber') as string) || '',
    passportIdNumber: (formData.get('passportIdNumber') as string) || '',
    salaryAmount: Number(formData.get('salaryAmount')) || 0,
    comissionPercentage: Number(formData.get('comissionPercentage')) || 0
  } satisfies EmployeeRequestBody

  try {
    // Validate the form data
    const validatedData = employeeSchema.parse(createEmployeeData)

    // Hash the password
    const hashedPassword = hash('sha256', validatedData.password)

    // Transform dates from string to Date objects
    const personalInfoData = {
      fullName: validatedData.fullName,
      nationality: validatedData.nationality,
      startWorkingDate: new Date(validatedData.startWorkingDate),
      finalWorkingDate: validatedData.finalWorkingDate
        ? new Date(validatedData.finalWorkingDate)
        : null,
      contractEndDate: validatedData.contractEndDate
        ? new Date(validatedData.contractEndDate)
        : null,
      residencyEndDate: validatedData.residencyEndDate
        ? new Date(validatedData.residencyEndDate)
        : null,
      personalIdNumber: validatedData.personalIdNumber,
      passportIdNumber: validatedData.passportIdNumber,
      salaryAmount: validatedData.salaryAmount,
      comissionPercentage: validatedData.comissionPercentage
    }

    // Start a transaction to ensure both inserts succeed or fail together
    const result = await database.transaction(async tx => {
      // Insert personal employee info first
      const [personalInfo] = await tx
        .insert(personalEmployeeInfo)
        .values(personalInfoData)
        .returning()

      // Insert system employee info with reference to personal info
      const [systemInfo] = await tx
        .insert(systemEmployeeInfo)
        .values({
          employeeId: personalInfo.id,
          username: validatedData.username,
          password: hashedPassword,
          role: validatedData.role
        })
        .returning()

      return { personalInfo, systemInfo }
    })

    if (!result) {
      throw new Error('Failed to create employee')
    }

    try {
      await signIn('credentials', {
        username: validatedData.username,
        password: validatedData.password,
        redirect: false
      })
    } catch (signInError) {
      console.error('Sign-in error:', signInError)
    }

    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }

    console.error('Employee creation error:', error)
    return {
      success: false,
      errors: [{ message: 'Failed to create employee. Please try again.' }]
    }
  }
}
