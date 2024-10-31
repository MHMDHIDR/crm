'use client'

import { Briefcase, CheckIcon, ClipboardList, MenuIcon, Users, XIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Navbar */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-14 items-center'>
          <div className='mr-4 hidden md:flex'>
            <Link className='mr-6 flex items-center space-x-2' href='/'>
              <Briefcase className='h-6 w-6' />
              <span className='hidden font-bold sm:inline-block'>CRM Pro</span>
            </Link>
            <nav className='flex items-center space-x-6 text-sm font-medium'>
              <Link href='#features'>Features</Link>
              <Link href='#pricing'>Pricing</Link>
            </nav>
          </div>
          <Link href='/signin' className='ml-auto'>
            <Button>Sign in</Button>
          </Link>
          <button className='ml-2 md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='fixed inset-0 z-50 bg-background md:hidden'>
          <div className='container flex flex-col items-center justify-center h-full space-y-6'>
            <Link href='#features' onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link href='#pricing' onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Button onClick={() => setIsMenuOpen(false)}>Close</Button>
          </div>
        </div>
      )}

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='w-full py-12 md:py-24 lg:py-32 xl:py-48'>
          <div className='container mx-auto px-4 md:px-6'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>
                  Streamline Your Business with CRM Pro
                </h1>
                <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400'>
                  Manage clients, tasks, and teams effortlessly. Boost productivity and grow your
                  business with our all-in-one CRM solution.
                </p>
              </div>
              <div>
                <Button onClick={scrollToFeatures}>Get Started</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id='features'
          className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-neutral-800 dark:text-white'
        >
          <div className='container mx-auto px-4 md:px-6'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
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
                  <p>Create, assign, and monitor tasks to ensure timely completion of projects.</p>
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

        {/* Benefits Section */}
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container mx-auto px-4 md:px-6'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
              Why Choose CRM Pro?
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex items-start space-x-4'>
                <CheckIcon className='w-6 h-6 text-green-500 flex-shrink-0' />
                <div>
                  <h3 className='font-bold'>Increased Productivity</h3>
                  <p className='text-gray-500 dark:text-gray-400'>
                    Streamline workflows and automate repetitive tasks.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-4'>
                <CheckIcon className='w-6 h-6 text-green-500 flex-shrink-0' />
                <div>
                  <h3 className='font-bold'>Better Customer Relationships</h3>
                  <p className='text-gray-500 dark:text-gray-400'>
                    Centralize client data for personalized interactions.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-4'>
                <CheckIcon className='w-6 h-6 text-green-500 flex-shrink-0' />
                <div>
                  <h3 className='font-bold'>Data-Driven Decisions</h3>
                  <p className='text-gray-500 dark:text-gray-400'>
                    Gain insights with comprehensive reporting and analytics.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-4'>
                <CheckIcon className='w-6 h-6 text-green-500 flex-shrink-0' />
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

        {/* Pricing Section */}
        <section
          id='pricing'
          className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-neutral-800 dark:text-white'
        >
          <div className='container mx-auto px-4 md:px-6'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12'>
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

      {/* Footer */}
      <footer className='w-full py-6 bg-gray-100 dark:bg-neutral-800 dark:text-white'>
        <div className='container mx-auto px-4 md:px-6'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex items-center gap-2'>
              <Briefcase className='h-6 w-6' />
              <span className='font-bold'>CRM Pro</span>
            </div>
            <nav className='flex gap-4 sm:gap-6'>
              <Link className='text-sm hover:underline underline-offset-4' href='#'>
                Terms of Service
              </Link>
              <Link className='text-sm hover:underline underline-offset-4' href='#'>
                Privacy Policy
              </Link>
            </nav>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              © 2024 CRM Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
