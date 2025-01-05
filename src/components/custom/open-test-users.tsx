import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export function OpenTestUsers({
  setTestUser
}: {
  setTestUser: (value: { email: string; password: string }) => void
}) {
  const TestUsers = [
    {
      email: 'admin@crm.technodevlabs.com',
      role: 'Admin',
      password: 'mM@123123'
    },
    {
      email: 'sup1@crm.technodevlabs.com',
      role: 'Supervisor',
      password: 'mM@123123'
    },
    {
      email: 'sup2@crm.technodevlabs.com',
      role: 'Supervisor',
      password: 'mM@123123'
    },
    {
      email: 'emp1@crm.technodevlabs.com',
      role: 'Employee',
      password: 'mM@123123'
    },
    {
      email: 'emp2@crm.technodevlabs.com',
      role: 'Employee',
      password: 'mM@123123'
    },
    {
      email: 'emp3@crm.technodevlabs.com',
      role: 'Employee',
      password: 'mM@123123'
    },
    {
      email: 'emp4@crm.technodevlabs.com',
      role: 'Employee',
      password: 'mM@123123'
    }
  ]

  return (
    <div className='grid grid-cols-2 gap-2'>
      <Sheet key={'bottom'}>
        <SheetTrigger asChild>
          <Button variant='outline'>See Test Users to Signin</Button>
        </SheetTrigger>
        <SheetContent side={'bottom'}>
          <SheetHeader>
            <SheetTitle>Test Users to Signin</SheetTitle>
            <SheetDescription>Use the following test users to signin:</SheetDescription>
          </SheetHeader>
          <div className='grid gap-4 py-4'>
            <Table>
              <TableCaption>
                Copy one of the Test Users to check out (Signin) the Dashboard
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Email</TableHead>
                  <TableHead className='text-center'>Role</TableHead>
                  <TableHead className='text-center'>Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TestUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className='text-center'>{user.role}</TableCell>
                    <TableCell className='text-center'>
                      <SheetClose asChild>
                        <Button
                          variant='outline'
                          onClick={() =>
                            setTestUser({ email: user.email, password: user.password })
                          }
                        >
                          Use This User
                        </Button>
                      </SheetClose>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type='button'>Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
