import { CheckIcon, ClipboardList, Users } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/auth'
import Footer from '@/components/custom/footer'
import Nav from '@/components/custom/nav'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { UserSession } from '@/db/schema'


export default async function HomePage(/*{ params }: { params: Promise<{ locale: Locale }> }*/) {
  // const locale = (await params).locale
  // setRequestLocale(locale)

  const session = await auth()
  const user = session?.user as UserSession

  return (
    <>
      <Nav user={user} />
      <div className='flex flex-col min-h-screen'>
        <main className='flex-1'>
          <section className='w-full py-12 md:py-24 lg:py-32 xl:py-48'>
            <div className='container px-4 mx-auto md:px-6'>
              <div className='flex flex-col items-center text-center space-y-4'>
                <div className='space-y-2'>
                  <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                    Streamline Your Business with CRM Pro
                  </h1>
                  <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400'>
                    Manage clients, tasks, and teams effortlessly. Boost productivity and grow your
                    business with our all-in-one CRM solution.
                  </p>
                </div>
                <Link href='#features'>
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </section>

          <section
            id='features'
            className='w-full py-12 bg-gray-100 md:py-24 lg:py-32 dark:bg-neutral-800 dark:text-white'
          >
            <div className='container px-4 mx-auto md:px-6'>
              <h2 className='mb-12 text-3xl font-bold tracking-tighter text-center sm:text-5xl'>
                Key Features
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <Users className='w-10 h-10 mb-2' />
                    <CardTitle>Client Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Efficiently organize and track client information, interactions, and history.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <ClipboardList className='w-10 h-10 mb-2' />
                    <CardTitle>Task Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Create, assign, and monitor tasks to ensure timely completion of projects.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Users className='w-10 h-10 mb-2' />
                    <CardTitle>Team Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Manage employees and supervisors, track performance, and optimize workflows.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className='w-full py-12 md:py-24 lg:py-32'>
            <div className='container px-4 mx-auto md:px-6'>
              <h2 className='mb-12 text-3xl font-bold tracking-tighter text-center sm:text-5xl'>
                Why Choose CRM Pro?
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>Increased Productivity</h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      Streamline workflows and automate repetitive tasks.
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>Better Customer Relationships</h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      Centralize client data for personalized interactions.
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>Data-Driven Decisions</h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      Gain insights with comprehensive reporting and analytics.
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>Scalable Solution</h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      Grow your business with a CRM that adapts to your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id='pricing'
            className='w-full py-12 bg-gray-100 md:py-24 lg:py-32 dark:bg-neutral-800 dark:text-white'
          >
            <div className='container px-4 mx-auto md:px-6'>
              <h2 className='mb-12 text-3xl font-bold tracking-tighter text-center sm:text-5xl'>
                Simple, Transparent Pricing
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Starter</CardTitle>
                    <CardDescription>For small teams getting started</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>$29/mo</p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Up to 5 users
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Basic reporting
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> 1GB storage
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className='w-full'>Get Started</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>For growing businesses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>$79/mo</p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Up to 20 users
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Advanced reporting
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> 10GB storage
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className='w-full'>Get Started</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>For large-scale operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>Custom</p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Unlimited users
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Custom reporting
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' /> Unlimited storage
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className='w-full'>Contact Sales</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  )
}
