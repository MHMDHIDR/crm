import { CheckIcon, ClipboardList, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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
import { Link } from '@/i18n/routing'

export default async function HomePage() {
  const session = await auth()
  const user = session?.user as UserSession

  const homeTranslations = await getTranslations('home')

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
                    {homeTranslations('hero.title')}
                  </h1>
                  <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400'>
                    {homeTranslations('hero.description')}
                  </p>
                </div>
                <Link href='#features'>
                  <Button>{homeTranslations('hero.getStarted')}</Button>
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
                {homeTranslations('features.title')}
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <Users className='w-10 h-10 mb-2' />
                    <CardTitle>{homeTranslations('features.clientManagement.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{homeTranslations('features.clientManagement.description')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <ClipboardList className='w-10 h-10 mb-2' />
                    <CardTitle>
                      <p>{homeTranslations('features.taskManagement.title')}</p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{homeTranslations('features.taskManagement.description')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Users className='w-10 h-10 mb-2' />
                    <CardTitle>{homeTranslations('features.teamManagement.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{homeTranslations('features.teamManagement.description')}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className='w-full py-12 md:py-24 lg:py-32'>
            <div className='container px-4 mx-auto md:px-6'>
              <h2 className='mb-12 text-3xl font-bold tracking-tighter text-center sm:text-5xl'>
                {homeTranslations('whyChoose.title')}
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>
                      {homeTranslations('whyChoose.productivity.title')}
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      {homeTranslations('whyChoose.productivity.description')}
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>
                      {homeTranslations('whyChoose.relationships.title')}
                    </h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      {homeTranslations('whyChoose.relationships.description')}
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>{homeTranslations('whyChoose.decisions.title')}</h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      {homeTranslations('whyChoose.decisions.description')}
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <CheckIcon className='flex-shrink-0 w-6 h-6 text-green-500' />
                  <div>
                    <h3 className='font-bold'>{homeTranslations('whyChoose.scalable.title')}</h3>
                    <p className='text-gray-500 dark:text-gray-400'>
                      {homeTranslations('whyChoose.scalable.description')}
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
                {homeTranslations('pricing.title')}
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>{homeTranslations('pricing.starter.title')}</CardTitle>
                    <CardDescription>
                      {homeTranslations('pricing.starter.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>
                      {homeTranslations('pricing.starter.price')}
                    </p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.starter.features.users')}
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.starter.features.reporting')}
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />{' '}
                        {homeTranslations('pricing.starter.features.storage')}
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href='/auth/signin' className='inline-flex w-full'>
                      <Button className='w-full'>
                        {homeTranslations('pricing.ctaButton.default')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{homeTranslations('pricing.professional.title')}</CardTitle>
                    <CardDescription>
                      {homeTranslations('pricing.professional.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>
                      {homeTranslations('pricing.professional.price')}
                    </p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.professional.features.users')}
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.enterprise.features.reporting')}
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.professional.features.storage')}
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href='/auth/signin' className='inline-flex w-full'>
                      <Button className='w-full'>
                        {homeTranslations('pricing.ctaButton.default')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{homeTranslations('pricing.enterprise.title')}</CardTitle>
                    <CardDescription>
                      {homeTranslations('pricing.enterprise.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>
                      {homeTranslations('pricing.enterprise.price')}
                    </p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.enterprise.features.users')}
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.enterprise.features.reporting')}
                      </li>
                      <li className='flex items-center'>
                        <CheckIcon className='w-4 h-4 mr-2 text-green-500' />
                        {homeTranslations('pricing.enterprise.features.storage')}
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href='/auth/signin' className='inline-flex w-full'>
                      <Button className='w-full'>
                        {homeTranslations('pricing.ctaButton.enterprise')}
                      </Button>
                    </Link>
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
