import { X, Check, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from './ui/button' // Ensure this path is correct, genius
import toast from 'react-hot-toast'
import React, { useState, useEffect } from 'react'
import { states } from '@/lib/states' // Assuming you set up path aliases, otherwise use relative path

// --- TYPES ---
// Because "any" is for cowards.

interface Candidate {
  candidate_id: number
  c_name: string
  // Add other fields if your API sends them, but we only need these
}

interface Region {
  id: number    // Ensure your lib/states.ts matches this structure!
  name: string
}

interface CreateElectionModalProps {
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  refetchElections?: () => void
}

interface NewElectionState {
  name: string
  description: string
  startDate: string
  endDate: string
  regionId: string // We keep it string in the form input, parse to int on submit
}

export default function CreateElectionModal({
  showCreateModal,
  setShowCreateModal,
  refetchElections
}: CreateElectionModalProps) {
  // State Management
  const [step, setStep] = useState<1 | 2>(1)
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(false)
  const [candidateList, setCandidateList] = useState<Candidate[]>([])
  
  const [newElection, setNewElection] = useState<NewElectionState>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    regionId: ''
  })
  
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([])
  const [newElectionId, setNewElectionId] = useState<number | null>(null)

  // --- FETCH CANDIDATES ON MOUNT ---
  useEffect(() => {
    if (showCreateModal) {
      const fetchCandidates = async () => {
        setLoadingCandidates(true)
        try {
          const res = await fetch('/api/candidate/list')
          if (!res.ok) throw new Error('Failed to fetch candidates')
          const data = await res.json()
          // Adjust 'data.candidates' if your API returns the array directly as 'data'
          setCandidateList(Array.isArray(data) ? data : data.candidates || [])
        } catch (error) {
          console.error(error)
          toast.error('Could not load candidates. API is garbage.')
        } finally {
          setLoadingCandidates(false)
        }
      }
      fetchCandidates()
    }
  }, [showCreateModal])

  const resetState = () => {
    setStep(1)
    setNewElection({ name: '', description: '', startDate: '', endDate: '', regionId: '' })
    setSelectedCandidates([])
    setNewElectionId(null)
    setShowCreateModal(false)
    if (refetchElections) refetchElections()
  }

  // --- STEP 1: CREATE ELECTION ---
  async function handleCreateElection() {
    const { name, startDate, endDate, regionId } = newElection

    // VALIDATION
    if (!name.trim() || !startDate || !endDate || !regionId) {
      return toast.error('Fill in all the fields.')
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return toast.error('End date cannot be before start date.')
    }

    try {
      const electionRes = await fetch('/api/election/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          e_name: name,
          start_time: startDate,
          end_time: endDate,
          region_id: parseInt(regionId) // The DB needs an INT
        })
      })

      const electionData = await electionRes.json()
      console.log(electionData)

      if (!electionRes.ok || !electionData.election_id) {
        console.error('Backend Response:', electionData)
        return toast.error(electionData.message || 'Election creation failed. Check console.')
      }

      setNewElectionId(electionData.election_id)
      toast.success('Election created! Time to pick the candidates.')
      setStep(2)
    } catch (err) {
      console.error(err)
      toast.error('Network error. Did you forget to start the server?')
    }
  }

  // --- STEP 2: ADD CANDIDATES ---
  async function handleAddParticipants() {
    if (selectedCandidates.length === 0) {
      return toast.error('Pick at least one candidate.')
    }

    if (!newElectionId) {
      return toast.error('Election ID is missing. ')
    }

    // Parallel requests because waiting for sequential loops is for boomers
    const addPromises = selectedCandidates.map(candidateId =>
      fetch('/api/participant/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          election_id: newElectionId
        })
      })
    )

    try {
      const results = await Promise.all(addPromises)
      const failedCount = results.filter(res => !res.ok).length

      if (failedCount > 0) {
        toast.error(`${failedCount} candidates failed. Check logs.`)
      } else {
        toast.success(`Successfully added ${selectedCandidates.length} candidates!`)
      }

      resetState()
    } catch (err) {
      console.error(err)
      toast.error('Batch add failed.')
    }
  }

  const toggleCandidate = (id: number) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  if (!showCreateModal) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl'>
        
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
             <h3 className='text-xl font-bold text-gray-900'>
               {step === 1 ? 'Create New Election' : 'Add Participants'}
             </h3>
             <p className='text-sm text-gray-500'>
               {step === 1 ? 'Step 1: Define Election' : `Step 2: Add Candidates`}
             </p>
          </div>
          <button onClick={resetState} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* STEP 1 FORM */}
        {step === 1 && (
          <div className='space-y-4'>
            {/* Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Election Name</label>
              <input
                type='text'
                value={newElection.name}
                onChange={e => setNewElection({ ...newElection, name: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all'
                placeholder='e.g. 2025 General Assembly'
              />
            </div>

            {/* Region Select from lib/states */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Region (State)</label>
              <select
                value={newElection.regionId}
                onChange={e => setNewElection({ ...newElection, regionId: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white'
              >
                <option value=''>Select a Region...</option>
                {/* WARNING: If states is just an array of strings ['A', 'B'], 
                   you need to map it differently: (name, idx) => <option value={idx+1}> 
                   Currently assuming states = [{ id: 1, name: '...' }]
                */}
                {states.map((name, idx: any) => (
                  <option value={idx+1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Start Date</label>
                <input
                  type='date'
                  value={newElection.startDate}
                  onChange={e => setNewElection({ ...newElection, startDate: e.target.value })}
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>End Date</label>
                <input
                  type='date'
                  value={newElection.endDate}
                  onChange={e => setNewElection({ ...newElection, endDate: e.target.value })}
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none'
                />
              </div>
            </div>

            <Button 
              onClick={handleCreateElection} 
              className='w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl mt-4 font-semibold shadow-lg shadow-teal-200'
            >
              Next: Select Candidates <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STEP 2 FORM */}
        {step === 2 && (
          <div className='space-y-4'>
            <div className='max-h-60 overflow-y-auto border rounded-xl p-2 space-y-2 bg-gray-50/50'>
               {loadingCandidates ? (
                 <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-2" />
                   <span className="text-sm">Fetching potential leaders...</span>
                 </div>
               ) : candidateList && candidateList.length > 0 ? (
                 candidateList.map(candidate => (
                   <div 
                     key={candidate.candidate_id} 
                     onClick={() => toggleCandidate(candidate.candidate_id)}
                     className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                       selectedCandidates.includes(candidate.candidate_id) 
                         ? 'bg-teal-50 border-teal-500 shadow-sm' 
                         : 'hover:bg-white border-transparent hover:shadow-sm'
                     }`}
                   >
                     <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                        selectedCandidates.includes(candidate.candidate_id) ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-white'
                     }`}>
                        {selectedCandidates.includes(candidate.candidate_id) && <Check className="w-3 h-3 text-white" />}
                     </div>
                     <span className="font-medium text-gray-700">{candidate.c_name}</span>
                   </div>
                 ))
               ) : (
                 <p className="text-center text-gray-500 py-4">No candidates found in the database. Add some first.</p>
               )}
            </div>
            
            <div className="text-sm text-gray-500 text-right font-medium">
              {selectedCandidates.length} candidates selected
            </div>

            <Button 
              onClick={handleAddParticipants} 
              disabled={selectedCandidates.length === 0}
              className='w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white h-12 rounded-xl font-semibold shadow-lg shadow-teal-200'
            >
              Finish & Add Participants
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}