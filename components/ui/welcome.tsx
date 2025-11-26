import axios from 'axios'
import { useEffect, useState } from 'react'

export default function Welcome () {
  const [balance, setBalance] = useState(0)
  const [name, setName] = useState('')
  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get('http://localhost:3000/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setBalance(response.data.data.balance)
        setName(response.data.data.firstName + " " + response.data.data.lastName)
      })
      .catch(e => {
        console.log(e)
      })
  }, [balance])

  return (
    <div className='mb-4 mt-18 text-center text-3xl font-bold gap-4 flex flex-col justify-center'>
      <p>Welcome {name}</p>
      <p className='text-neutral-400'>Your Balance: ₹{balance/100}</p>
    </div>
  )
}
