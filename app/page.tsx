'use client'

import Link from 'next/link'
import { Vote, ChevronRight, Lock, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackgroundLines } from '@/components/ui/background-lines'

export default function Home () {
  return (
    <main className='min-h-screen bg-white'>
      <nav className='fixed top-0 left-0 right-0 z-50 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2 cursor-pointer'>
            <div className='w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center'>
              <Vote className='w-4 h-4 text-white' />
            </div>
            <span className='font-semibold text-gray-900'>EVM</span>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              asChild
              variant='outline'
              size='sm'
              className='text-gray-600 bg-transparent shadow-none hover:border-gray-400 hover:text-gray-900 hover:bg-gray-100 border-none'
            >
              <Link href='/login'>Login</Link>
            </Button>
            <Button asChild size='sm' variant='dash' className=''>
              <Link href='/signup'>Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      <BackgroundLines>
        <section className='pt-32 pb-20 px-6 relative selection:bg-emerald-300'>
          <div className='max-w-4xl mx-auto text-center absolute z-10 inset-0 top-30 fade-in animate-in slide-out-to-start duration-500'>
            <h1 className='mt-8 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 text-balance'>
              Online Voting Portal
              <br />
              <span className='text-gray-400'>Your Vote Matters</span>
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto text-pretty'>
              Experience seamless and secure digital voting.
            </p>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto mb-10 text-pretty z-40'>
              Cast your vote from anywhere, anytime, with complete peace of
              mind.
            </p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Button
                asChild
                size='lg'
                variant='dash'
                className='px-8 py-7 z-50'
              >
                <Link href='/signup'>Sign Up</Link>
              </Button>
              <Link
                href='/login'
                className='p-[3px] relative hover:cursor-pointer font-rubik z-50'
              >
                <div className='absolute inset-0 bg-linear-to-r from-lime-400 to-yellow-400 rounded-lg' />
                <div className='px-6 py-3 bg-white rounded-[6px] relative group transition-all duration-600 text-black hover:bg-transparent hover:text-black hover:scale-105 antialiased'>
                  Login to Vote
                </div>
              </Link>
            </div>
          </div>
        </section>
      </BackgroundLines>

      <section className='py-20 px-6 bg-gray-50/80'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='inline-flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 mb-4'>
                <Lock className='w-3 h-3 text-gray-600' />
                <span className='text-xs font-medium text-gray-600 uppercase tracking-wide'>
                  Admin Access
                </span>
              </div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Powerful Admin Dashboard
              </h2>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                Create and Manage Elections
              </p>
              <div className='flex flex-col max-w-60 gap-4'>
                <Button asChild size='lg' variant='dash' className=''>
                  <Link href='/admin/login'>
                    <Lock className='w-4 h-4 mr-2' />
                    Admin Login
                  </Link>
                </Button>
                <Button asChild variant='outline' size='lg' className=''>
                  <Link href='/admin/dashboard'>
                    <LayoutDashboard className='w-4 h-4 mr-2' />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
            <div className='relative'>
              <div className='bg-white rounded-2xl border border-gray-200 shadow-xl p-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center'>
                    <LayoutDashboard className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      Admin Dashboard
                    </h3>
                    <p className='text-xs text-gray-500'>
                      Election Management System
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        Active Elections
                      </span>
                      <span className='text-lg font-bold text-gray-900'>
                        12
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-gray-900 h-2 rounded-full'
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Total Voters
                      </span>
                      <span className='text-xl font-bold text-gray-900'>
                        24,892
                      </span>
                    </div>
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <span className='text-xs text-gray-500 block mb-1'>
                        Votes Today
                      </span>
                      <span className='text-xl font-bold text-gray-900'>
                        1,247
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='absolute -z-10 -top-4 -right-4 w-full h-full bg-gray-200 rounded-2xl' />
            </div>
          </div>
        </div>
      </section>

      <section className='py-10 px-6 bg-gray-900 max-h-60'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>Ready to Vote?</h2>
          <p className='text-gray-400 mb-8'>
            Just login and participate in Online Voting trusted by thousands of
            Indians.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button
              asChild
              size='lg'
              variant='dash'
              className='bg-white text-gray-900 hover:bg-gray-100 px-8'
            >
              <Link href='/signup'>
                Sign Up Now
                <ChevronRight className='w-4 h-4 ml-1' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-gray-700 text-white hover:bg-gray-800 hover:text-white hover:scale-105 bg-transparent'
            >
              <Link href='/login'>Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
