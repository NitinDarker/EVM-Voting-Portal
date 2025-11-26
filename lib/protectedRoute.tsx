import axios from 'axios'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProtectedRoute ({
  children
}: {
  children: React.ReactNode
}) {
  const [isValid, setIsValid] = useState<boolean>(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsValid(false)
      navigate('/', { replace: true })
      return
    }

    axios
      .get('http://localhost:3000/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.data.success) {
          setIsValid(true)
        } else {
          localStorage.removeItem('token')
          setIsValid(false)
          navigate('/', { replace: true })
        }
      })
      .catch(() => {
        // Token invalid or expired
        localStorage.removeItem('token')
        setIsValid(false)
        navigate('/', { replace: true })
      })
  }, [navigate])

  if (isValid) return children
  return null
}
