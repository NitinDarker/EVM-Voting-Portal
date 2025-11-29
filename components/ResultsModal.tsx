'use client'

import { useEffect, useState } from 'react'
import { X, Trophy, BarChart3, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface ResultDetail {
  candidate_id: number
  c_name: string
  total_votes: number
}

interface ResultResponse {
  election_name: string
  results_released: boolean
  total_votes_cast: number
  results: ResultDetail[]
}

export function ResultModal ({
  isOpen,
  onClose,
  electionId
}: {
  isOpen: boolean
  onClose: () => void
  electionId: number | null
}) {
  const [data, setData] = useState<ResultResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && electionId) {
      fetchResults()
    }
  }, [isOpen, electionId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      // We assume this endpoint is public or checks cookie auth
      const res = await axios.get(`/api/results/${electionId}`)
      console.log(res)
      setData(res.data)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-xs'
        onClick={onClose}
      />
      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
        <div className='bg-gray-800 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center'>
              <BarChart3 className='w-5 h-5 text-white' />
            </div>
            <h2 className='text-white font-semibold'>Election Results</h2>
          </div>
          <button
            onClick={onClose}
            className='text-white cursor-pointer rounded-md bg-red-600 transition-all hover:scale-105 duration-500 p-1'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 min-h-[300px]'>
          {loading ? (
            <div className='h-full flex flex-col items-center justify-center text-gray-400 py-12'>
              <Loader2 className='w-8 h-8 animate-spin mb-2' />
              <p>Tallying votes...</p>
            </div>
          ) : error ? (
            <div className='flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl'>
              <AlertCircle className='w-5 h-5' />
              <p>{error}</p>
            </div>
          ) : data ? (
            <div className='space-y-6'>
              <div className='text-center'>
                <h3 className='text-xl font-bold text-gray-900'>
                  {data.election_name}
                </h3>
                <p className='text-sm text-gray-500'>
                  Total Votes Cast: {data.total_votes_cast}
                </p>
              </div>

              <div className='space-y-3'>
                {data.results.map((candidate, index) => {
                  const isWinner = index === 0 && candidate.total_votes > 0
                  const percentage =
                    data.total_votes_cast > 0
                      ? (
                          (candidate.total_votes / data.total_votes_cast) *
                          100
                        ).toFixed(1)
                      : 0

                  return (
                    <div key={candidate.candidate_id} className='relative'>
                      <div
                        className={`relative z-10 p-3 rounded-xl border flex items-center justify-between ${
                          isWinner
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              isWinner
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className='font-semibold text-gray-900 flex items-center gap-2'>
                              {candidate.c_name}
                              {isWinner && (
                                <Trophy className='w-3.5 h-3.5 text-amber-500' />
                              )}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold text-gray-900'>
                            {candidate.total_votes}
                          </p>
                          <p className='text-xs text-gray-500'>{percentage}%</p>
                        </div>
                      </div>
                      {/* Progress Bar Background */}
                      <div
                        className={`absolute top-0 left-0 h-full rounded-xl opacity-10 transition-all duration-1000 ${
                          isWinner ? 'bg-amber-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%`, zIndex: 0 }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
