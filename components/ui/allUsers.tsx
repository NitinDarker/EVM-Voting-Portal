import axios from 'axios'
import { useEffect, useState, useCallback } from 'react'
import { Send, Search } from 'lucide-react'
import Avatar from './Avatar'

type User = {
  _id: string
  username: string
  phone?: string
  firstName?: string
  lastName?: string
}

export default function AllUsers () {
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState('') 
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async (search = '') => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://localhost:3000/api/user/bulk?filter=${encodeURIComponent(
          search
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setUsers(response.data.users)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error(err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ Fetch all initially
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ✅ Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(filter)
    }, 300)
    return () => clearTimeout(timeout)
  }, [filter, fetchUsers])

  const handleSendMoney = (userId: string) => {
    console.log('Send money to:', userId)
  }

  return (
    <div className='p-8 text-white'>
      <div className='flex items-center justify-between mb-6'>
        {/* Left side — heading and count */}
        <div>
          <h1 className='text-3xl font-semibold mb-1'>All Users</h1>
          <p className='text-neutral-400 text-sm'>
            {users.length} {users.length === 1 ? 'user' : 'users'} found
          </p>
        </div>

        {/* Right side — search bar */}
        <div className='relative w-md md:w-1/3'>
          <Search
            size={18}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500'
          />
          <input
            type='text'
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder='Search users by name...'
            className='w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500'
          />
        </div>
      </div>

      {/* Users grid */}
      {loading ? (
        <p className='text-center text-neutral-400 italic'>Loading...</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {users.length > 0 ? (
            users.map(u => {
              const colorIndex =
                [...u.username].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6

              return (
                <div
                  key={u._id}
                  className='flex justify-between items-center bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-150 rounded-xl p-5'
                >
                  <div className='flex items-center gap-4'>
                    <Avatar
                      firstName={u.firstName || u.username}
                      lastName={u.lastName}
                      size={48}
                      colorIndex={colorIndex}
                    />

                    <div>
                      <p className='text-lg font-medium'>
                        {u.firstName} {u.lastName}
                      </p>
                      <p className='text-sm text-neutral-400'>@{u.username}</p>
                      <p className='text-sm text-neutral-500'>
                        📞 {u.phone || 'No phone'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendMoney(u._id)}
                    className='flex items-center gap-2 bg-blue-600 hover:bg-blue-800 py-2 px-4 rounded-lg font-medium transition-all cursor-pointer duration-150'
                  >
                    <Send size={16} />
                    Send
                  </button>
                </div>
              )
            })
          ) : (
            <div className='col-span-2 text-center text-neutral-400 py-10 italic'>
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
