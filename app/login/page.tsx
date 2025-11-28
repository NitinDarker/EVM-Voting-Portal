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
import { states } from '@/lib/states'
import Link from 'next/link'
import { GlowingEffect } from '@/components/ui/glowing-effect'

export default function Signup () {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [selected, setSelected] = useState('')
  const [cred, setCred] = useState({
    username: '',
    phone: Number(),
    firstName: '',
    lastName: '',
    password: ''
  })

  async function signupHandler () {
    const payload = {
      ...cred,
      phone: Number(cred.phone)
    }

    if (!payload.username.trim()) return toast.error('Please enter a username.')
    if (payload.username.trim().length < 3)
      return toast.error('Username must be at least 3 characters long.')
    if (!payload.phone) return toast.error('Please enter a valid phone number.')
    if (!/^\d{10}$/.test(payload.phone.toString()))
      return toast.error('Phone number must be exactly 10 digits.')

    if (!payload.firstName.trim())
      return toast.error('Please enter your first name.')
    if (!payload.lastName.trim())
      return toast.error('Please enter your last name.')

    if (!payload.password.trim()) return toast.error('Please set a password.')
    if (payload.password.length < 8)
      return toast.error('Password must be at least 8 characters long.')

    const response = await toast.promise(
      axios.post('http://localhost:3000/api/auth/register', payload),
      {
        loading: 'Creating your account...',
        success: `Account created successfully!`,
        error: err =>
          err?.response?.data?.error || 'Signup failed. Please try again.'
      }
    )

    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      setTimeout(() => router.push('/dashboard'), 500)
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
            <CardTitle>Create an Account</CardTitle>
          </CardHeader>
          <CardContent className='flex gap-6 flex-col'>
            <div>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                placeholder='Enter your Full Name'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Enter your email'
                onChange={handleChange}
              />
            </div>
            <div className='w-full'>
              <label className='block mb-1'>State</label>
              <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                className='w-full px-3 py-2 border rounded-md border-neutral-700 focus:ring-emerald-600 bg-transparent text-neutral-700 text-sm shadow-xs transition-[color,box-shadow] outline-none'
              >
                <option value='' className=''>
                  Select State
                </option>
                {states.map((state, i) => (
                  <option key={i} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className='relative'>
              <Label htmlFor='password'>Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                id='password'
                placeholder='Enter your Password'
                onChange={handleChange}
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
              type='submit'
              variant='primary'
              size='full'
              onClick={signupHandler}
            >
              Sign Up
            </Button>
            <div>
              <span>Already have an account? </span>
              <Link href='/signin' className='text-neutral-500 underline'>
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </DotBackgroundDemo>
    </>
  )
}
