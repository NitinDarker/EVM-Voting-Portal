'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { DotBackgroundDemo } from '@/components/ui/dotBackground'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlowingEffect } from '@/components/ui/glowing-effect'

export default function Signup () {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [cred, setCred] = useState({
    email: '',
    password: ''
  })

  async function adminLoginHandler () {
    if (!cred.email.trim() || !cred.email.includes('@'))
      return toast.error('Please enter a valid email address.')
    if (!cred.password.trim() || cred.password.length < 8)
      return toast.error('Password must be at least 8 characters long.')

    const payload = {
      email: cred.email,
      password: cred.password,
    }

    const response = await toast.promise(
      axios.post('/api/auth/admin/login', payload),
      {
        loading: 'Logging in...',
        success: `Logged in successfully.`,
        error: err => err?.response?.data?.error || 'Log In Failed'
      }
    )

    if (response.data.success) {
      setTimeout(() => router.push('/admin/dashboard'), 500)
    }
  }

  function handleChange (e: React.ChangeEvent<HTMLInputElement>) {
    setCred({ ...cred, [e.target.id]: e.target.value })
  }

  return (
    <>
      <DotBackgroundDemo>
        <Card className='w-md h-auto bg-white text-gray-800 border-neutral-700 border fade-in shadow-2xl animate-in slide-out-to-start-20 duration-1000 antialiased'>
          <GlowingEffect
            blur={0}
            borderWidth={5}
            spread={80}
            glow={true}
            disabled={false}
            proximity={84}
            inactiveZone={0.01}
          />
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-6 flex-col'>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Enter your email'
                onChange={handleChange}
                value={cred.email}
              />
            </div>
            <div className='relative'>
              <Label htmlFor='password'>Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                id='password'
                placeholder='Enter your Password'
                onChange={handleChange}
                value={cred.password}
              />
              <Button
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                className='absolute right-1 w-auto top-6 bg-transparent text-white cursor-pointer hover:text-neutral-300 transition-all duration-200 h-auto hover:bg-transparent'
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={2} className='stroke-black' />
                ) : (
                  <Eye size={16} strokeWidth={2} className='stroke-black' />
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-3 items-center justify-center'>
            <Button
              onClick={adminLoginHandler}
              size='full'
              variant='dash'
              className='px-8 py-2 z-50 hover:shadow-2xl'
            >
              Log In
            </Button>
            <div>
              <span>Login as a Voter? </span>
              <Link href='/login' className='text-neutral-500 underline'>
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </DotBackgroundDemo>
    </>
  )
}
