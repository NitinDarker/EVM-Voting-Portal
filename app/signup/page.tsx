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
    name: '',
    email: '',
    password: ''
  })

  async function sendOtpHandler () {
    const region_id = states.indexOf(selected) + 1

    if (!cred.name.trim()) return toast.error('Please enter your full name.')
    if (!cred.email.trim() || !cred.email.includes('@'))
      return toast.error('Please enter a valid email address.')
    if (region_id <= 0) return toast.error('Please select your state/region.')
    if (!cred.password.trim() || cred.password.length < 8)
      return toast.error('Password must be at least 8 characters long.')

    const payload = {
      name: cred.name,
      email: cred.email,
      password: cred.password,
      region_id: region_id
    }

    const response = await toast.promise(
      axios.post('/api/auth/register/send-otp', payload),
      {
        loading: 'Sending OTP...',
        success: `OTP sent successfully.`,
        error: err => err?.response?.data?.error || 'Failed to send OTP'
      }
    )

    if (response.data.success) {
      sessionStorage.setItem('temp_reg_email', cred.email)
      setTimeout(() => router.push('/signup/verify-otp'), 500)
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
                value={cred.name}
              />
            </div>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Enter your email'
                onChange={handleChange}
                value={cred.email}
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
              onClick={sendOtpHandler}
              size='full'
              variant='dash'
              className='px-8 py-2 z-50 hover:shadow-2xl'
            >
              Sign Up
            </Button>
            <div>
              <span>Already have an account? </span>
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
