'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DotBackgroundDemo } from './ui/dotBackground'
import { GlowingEffect } from './ui/glowing-effect'
import toast from 'react-hot-toast'

export default function OtpVerification () {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const emailRef = useRef<string>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
    emailRef.current = sessionStorage.getItem('temp_reg_email')
  }, [])

  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [resendTimer, canResend])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    const lastIndex = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleVerify = async () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) return

    setIsVerifying(true)

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRef.current,
          otp: otpValue
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Verification failed')
        setIsVerifying(false)
        return
      }

      toast.success('Account Created Successfully!')
      sessionStorage.removeItem('temp_reg_email')
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('VERIFY OTP REQUEST FAILED:', err)
      toast.error('Server error.')
    }

    setIsVerifying(false)
  }

  const handleResend = () => {
    if (!canResend) return
    setResendTimer(30)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  const isComplete = otp.every(digit => digit !== '')

  return (
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
        <CardHeader className='space-y-2 mb-8'>
          <CardTitle className=''>Verify OTP</CardTitle>
          <CardTitle className='text-sm font-medium'>
            Enter the 6-digit code sent to {emailRef.current}
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-zinc-700 mb-2'>
              Verification Code
            </label>
            <div className='flex justify-between gap-2' onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => {
                    inputRefs.current[index] = el
                  }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className='w-12 h-14 text-center text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all'
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className='text-center'>
            {canResend ? (
              <p className='text-sm text-gray-500'>
                Didn't receive the code?{' '}
                <button
                  onClick={handleResend}
                  className='text-zinc-500 font-un cursor-pointer underline hover:text-emerald-700 font-medium hover:underline'
                >
                  Resend OTP
                </button>
              </p>
            ) : (
              <p className='text-sm text-gray-500'>
                Resend code in{' '}
                <span className='font-semibold text-gray-700'>
                  {resendTimer}s
                </span>
              </p>
            )}
          </div>

          <Button
            onClick={handleVerify}
            variant='dash'
            disabled={!isComplete || isVerifying}
            className='w-full h-12 disabled:opacity-50 disabled:bg-neutral-600 disabled:cursor-not-allowed'
          >
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </Button>

          {/* Back to Sign Up Link */}
          <p className='text-center text-sm text-gray-500'>
            Wrong number?{' '}
            <Link
              href='/signup'
              className='text-emerald-600 hover:text-emerald-700 font-medium hover:underline'
            >
              Go Back
            </Link>
          </p>
        </CardContent>
      </Card>
    </DotBackgroundDemo>
  )
}
