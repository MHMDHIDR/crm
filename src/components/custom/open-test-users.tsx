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

export function OpenTestUsers() {
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
                <TableRow>
                  <TableCell className='font-medium'>admin@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Admin</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>sup1@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Supervisor</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>sup2@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Supervisor</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>emp1@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Employee</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>emp2@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Employee</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>emp3@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Employee</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>emp4@crm.technodevlabs.com</TableCell>
                  <TableCell className='text-center'>Employee</TableCell>
                  <TableCell className='text-center'>mM@123123</TableCell>
                </TableRow>
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
