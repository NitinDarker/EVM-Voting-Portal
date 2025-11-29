'use client'

import { useState } from 'react'
import { X, Vote, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Candidate {
  candidate_id: number
  candidate_name: string
  party_name: string
  party_symbol?: string
}

interface Election {
  election_id: number
  election_name: string
  description: string
}

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  election: Election | null
  candidates: Candidate[]
  onVoteSuccess?: () => void
}

export function VoteModal ({
  isOpen,
  onClose,
  election,
  candidates,
  onVoteSuccess
}: VoteModalProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !election) return null

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate to vote')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/vote/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          election_id: election.election_id,
          candidate_id: selectedCandidate
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to cast vote')

      setVoteSuccess(true)
      setTimeout(() => {
        onVoteSuccess?.()
        handleClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to cast vote')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedCandidate(null)
    setVoteSuccess(false)
    setError('')
    onClose()
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/30 backdrop-blur-xs'
        onClick={handleClose}
      />
      <div className='relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden'>
        <div className='bg-emerald-600 px-6 py-5 text-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 mr-2 bg-black/50 rounded-xl flex items-center justify-center'>
                <Vote className='w-5 h-5' />
              </div>
              <div>
                <h2 className='font-semibold text-xl'>Cast Your Vote</h2>
                <p className='text-teal-100 text-sm'>
                  {election.election_name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className='w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 border-red-300 cursor-pointer hover:scale-105 flex items-center justify-center transition-all duration-500'
            >
              <X className='w-4 h-4 hover:scale-105' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          {voteSuccess ? (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle2 className='w-8 h-8 text-teal-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Vote Cast Successfully!
              </h3>
              <p className='text-gray-500'>
                Thank you for participating in the democratic process.
              </p>
            </div>
          ) : (
            <>
              <p className='text-gray-600 text-sm'>
                Select your preferred candidate below.
              </p>
              <p className='text-gray-600 mb-6 text-sm'>
                Your vote is anonymous and secure.
              </p>

              {error && (
                <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm mb-4'>
                  <AlertCircle className='w-4 h-4 shrink-0' />
                  {error}
                </div>
              )}

              {/* Candidates List */}
              <div className='space-y-3 max-h-[300px] overflow-y-auto pr-1'>
                {candidates.map(candidate => (
                  <button
                    key={candidate.candidate_id}
                    onClick={() => setSelectedCandidate(candidate.candidate_id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 hover:cursor-pointer ${
                      selectedCandidate === candidate.candidate_id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        selectedCandidate === candidate.candidate_id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <User className='w-6 h-6' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-semibold text-gray-900'>
                        {candidate.candidate_name}
                      </h4>
                      <p className='text-sm text-gray-500'>
                        {candidate.party_name}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedCandidate === candidate.candidate_id
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedCandidate === candidate.candidate_id && (
                        <CheckCircle2 className='w-4 h-4 text-white' />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Warning */}
              <div className='mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg'>
                <p className='text-xs text-amber-800'>
                  <strong>Important:</strong> Once submitted, your vote cannot
                  be changed. Please review your selection carefully before
                  confirming.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!voteSuccess && (
          <div className='border-t border-gray-100 px-6 py-3 bg-gray-50/60 flex items-center justify-end gap-3'>
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
              className='border-gray-200 bg-white'
            >
              Cancel
            </Button>
            <Button
              onClick={handleVote}
              disabled={!selectedCandidate || isSubmitting}
              variant='dash'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Submitting...
                </>
              ) : (
                <>
                  <Vote className='w-4 h-4 mr-2' />
                  Confirm Vote
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
