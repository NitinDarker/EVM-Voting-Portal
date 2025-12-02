'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Vote,
  LogOut,
  Plus,
  Users,
  Calendar,
  Edit3,
  StopCircle,
  Trophy,
  BarChart3,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import AddCandidateModal from '@/components/AddCandidateModal'
import CreateElectionModal from '@/components/CreateElectionModal'
import { BackgroundBeams } from '@/components/ui/background-beams'

// --- Types ---
interface Admin {
  admin_id: number
  a_name: string
  a_email: string
}

interface Election {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'completed'
  candidates: Candidate[]
  totalVotes: number
}

interface Candidate {
  id: number
  name: string
  party: string
  votes: number
}

// --- Component ---
export default function AdminDashboard ({ admin }: { admin: Admin }) {
  // State
  const [elections, setElections] = useState<Election[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Selection
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  )

  // Add Candidate Modal State
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' })
  const [partyList, setPartyList] = useState<any[]>([])
  const [selectedParty, setSelectedParty] = useState<string>('')
  const [addNewParty, setAddNewParty] = useState(false)
  const [newParty, setNewParty] = useState<any>({ name: '', symbol: '' })

  const router = useRouter()

  // --- Fetch Logic ---
  const fetchElections = useCallback(async () => {
    setIsLoading(true)
    try {
      const [activeRes, pastRes] = await Promise.all([
        fetch('/api/admin/election/active'),
        fetch('/api/admin/election/past')
      ])

      const activeData = await activeRes.json()
      const pastData = await pastRes.json()

      const mapToElection = (data: any, type: 'active' | 'past'): Election => {
        let status: 'draft' | 'active' | 'completed' = 'active'
        const now = new Date()
        const start = new Date(data.start_time)
        const end = new Date(data.end_time)

        if (type === 'past') {
          status = 'completed'
        } else if (start > now) {
          status = 'draft'
        } else if (end < now) {
          status = 'completed'
        } else {
          status = 'active'
        }

        return {
          id: data.election_id,
          name: data.e_name,
          description: data.description || 'No description provided',
          startDate: data.start_time,
          endDate: data.end_time,
          status: status,
          totalVotes: data.total_votes || 0,
          candidates: Array.isArray(data.candidates)
            ? data.candidates.map((c: any) => ({
                id: c.candidate_id,
                name: c.c_name,
                party: c.party_name || 'Independent',
                votes: c.vote_count || 0
              }))
            : []
        }
      }

      const activeList = Array.isArray(activeData)
        ? activeData.map((e: any) => mapToElection(e, 'active'))
        : Array.isArray(activeData.elections)
        ? activeData.elections.map((e: any) => mapToElection(e, 'active'))
        : []

      const pastList = Array.isArray(pastData)
        ? pastData.map((e: any) => mapToElection(e, 'past'))
        : Array.isArray(pastData.elections)
        ? pastData.elections.map((e: any) => mapToElection(e, 'past'))
        : []

      // --- DUPLICATE FIX ---
      const rawList = [...activeList, ...pastList]
      
      // We use a Map to ensure uniqueness by ID. 
      // This solves the "Encountered two children with same key" error.
      const uniqueElectionsMap = new Map()
      rawList.forEach(item => {
        uniqueElectionsMap.set(item.id, item)
      })

      const allElections = Array.from(uniqueElectionsMap.values()).sort(
        (a: any, b: any) => b.id - a.id
      )
      // ---------------------

      setElections(allElections)
    } catch (error) {
      console.error('Error fetching elections:', error)
      toast.error('Could not load elections')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial Fetch
  useEffect(() => {
    fetchElections()
  }, [fetchElections])

  // Fetch Parties for Modal
  useEffect(() => {
    if (!showCandidateModal) return

    async function loadParties () {
      try {
        const res = await fetch('/api/party/list')
        const data = await res.json()
        if (Array.isArray(data.parties)) {
          setPartyList(data.parties)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadParties()
  }, [showCandidateModal])

  // --- Handlers ---
  const handleStopElection = async (electionId: number) => {
    try {
      const res = await fetch('/api/election/stop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ election_id: electionId })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to stop election')
      }

      toast.success('Election stopped. Results announced!')

      setElections(
        elections.map(e =>
          e.id === electionId
            ? { ...e, status: 'completed', endDate: new Date().toISOString() }
            : e
        )
      )
    } catch (err: any) {
      console.error(err)
      toast.error(err.message)
    }
  }

  const handleStartElection = async (electionId: number) => {
    toast.success('Simulation: Election started')
    setElections(
      elections.map(e => (e.id === electionId ? { ...e, status: 'active' } : e))
    )
  }

  const handleDeleteElection = async (electionId: number) => {
    toast.success('Simulation: Election deleted')
    setElections(elections.filter(e => e.id !== electionId))
  }

  const logoutHandler = async () => {
    try {
      const res = await fetch('/api/auth/admin/logout')
      if (res.ok) {
        toast.success('Logged out successfully')
        router.push('/admin/login')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- Helpers ---
  const getStatusBadge = (status: Election['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-teal-50 text-teal-700 border-teal-200'>
            <span className='w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5' />
            Active
          </Badge>
        )
      case 'completed':
        return (
          <Badge className='bg-gray-100 text-gray-600 border-gray-200'>
            <CheckCircle2 className='w-3 h-3 mr-1' />
            Completed
          </Badge>
        )
      default:
        return (
          <Badge className='bg-amber-50 text-amber-700 border-amber-200'>
            <Clock className='w-3 h-3 mr-1' />
            Draft
          </Badge>
        )
    }
  }

  const getWinner = (election: Election) => {
    if (election.status !== 'completed' || election.candidates.length === 0)
      return null
    return election.candidates.reduce((prev, curr) =>
      curr.votes > prev.votes ? curr : prev
    )
  }

  const stats = {
    totalElections: elections.length,
    activeElections: elections.filter(e => e.status === 'active').length,
    completedElections: elections.filter(e => e.status === 'completed').length,
    totalVotes: elections.reduce((sum, e) => sum + e.totalVotes, 0)
  }

  return (
    // PARENT CONTAINER: Relative to contain absolute children, min-h-screen for full height
    <div className='min-h-screen relative bg-neutral-200 animate-in fade-in duration-500 antialiased'>
      
      {/* BEAMS: Absolute, z-0 to sit behind content but above background color */}
      <BackgroundBeams className='absolute inset-0 z-0 h-full w-full' />

      {/* HEADER: Sticky, z-50 to stay on top of everything */}
      <header className='sticky top-0 z-50 bg-neutral-100/80 border-b border-gray-200 backdrop-blur-md shadow-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-black rounded-xl flex items-center justify-center'>
                <Vote className='w-5 h-5 text-white' />
              </div>
              <div>
                <h1 className='font-semibold text-gray-900'>Admin Dashboard</h1>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={logoutHandler}
              className='border-gray-200 text-gray-600 hover:text-gray-900 bg-transparent'
            >
              <LogOut className='w-4 h-4 mr-2' />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Relative, z-10 to ensure it sits ON TOP of the beams */}
      <main className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className='bg-neutral-50 rounded-2xl border border-gray-200 p-6 mb-8 shadow-xl'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                Welcome, {admin.a_name}
              </h2>
              <p className='text-gray-500 text-sm'>
                Manage elections, candidates, and view results
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant='dash'
            >
              <Plus className='w-4 h-4 mr-2' />
              Create Election
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <button
            onClick={() => setShowCreateModal(true)}
            className='shadow-xl cursor-pointer flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left hover:-translate-y-1 duration-500'
          >
            <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center'>
              <Plus className='w-5 h-5 text-emerald-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>Create Election</p>
              <p className='text-xs text-gray-500'>Set up a new election</p>
            </div>
          </button>
          <button
            onClick={() => {
              if (elections.length > 0) {
                const target =
                  elections.find(e => e.status === 'draft') || elections[0]
                setSelectedElection(target)
                setShowCandidateModal(true)
              } else {
                toast.error('Create an election first!')
              }
            }}
            className='shadow-xl cursor-pointer flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left hover:-translate-y-1 duration-500'
          >
            <div className='w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center'>
              <Users className='w-5 h-5 text-amber-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>Add Candidates</p>
              <p className='text-xs text-gray-500'>Register new candidates</p>
            </div>
          </button>
          <button
            onClick={() => {
              const activeElection =
                elections.find(e => e.status === 'active') ||
                elections.find(e => e.status === 'draft')
              if (activeElection) {
                setSelectedElection(activeElection)
                setShowEditModal(true)
              } else {
                toast.error('No active or draft elections to edit')
              }
            }}
            className='flex shadow-xl cursor-pointer items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left hover:-translate-y-1 duration-500'
          >
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <Edit3 className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>Edit Election</p>
              <p className='text-xs text-gray-500'>Modify election details</p>
            </div>
          </button>
          <button
            onClick={() => {
              const activeElection = elections.find(e => e.status === 'active')
              if (activeElection) handleStopElection(activeElection.id)
              else toast.error('No active election running')
            }}
            className='flex shadow-xl cursor-pointer items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-left hover:-translate-y-1 duration-500'
          >
            <div className='w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center'>
              <StopCircle className='w-5 h-5 text-rose-600' />
            </div>
            <div>
              <p className='font-medium text-gray-900'>Stop Election</p>
              <p className='text-xs text-gray-500'>End & announce results</p>
            </div>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <Card className='border-gray-200 shadow-xl hover:scale-95 duration-1000 transition-all'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Total Elections
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.totalElections}
                  </p>
                </div>
                <div className='w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center'>
                  <Vote className='w-6 h-6 text-teal-600' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='border-gray-200 shadow-xl hover:scale-95 duration-1000 transition-all'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Active Elections
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.activeElections}
                  </p>
                </div>
                <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center'>
                  <Clock className='w-6 h-6 text-emerald-600' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='border-gray-200 shadow-xl hover:scale-95 duration-1000 transition-all'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Completed
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.completedElections}
                  </p>
                </div>
                <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
                  <CheckCircle2 className='w-6 h-6 text-gray-600' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='border-gray-200 shadow-xl hover:scale-95 duration-1000 transition-all'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Total Votes
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {stats.totalVotes.toLocaleString()}
                  </p>
                </div>
                <div className='w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center'>
                  <BarChart3 className='w-6 h-6 text-amber-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Elections List */}
        <Card className='border-gray-200 mb-8 shadow-xl'>
          <CardHeader className='border-b border-gray-100 h-15'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>Your Elections</CardTitle>
                <CardDescription>
                  Manage and monitor all elections
                </CardDescription>
              </div>
              <Badge
                variant='secondary'
                className='bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:scale-105 transition-all duration-500 self-start md:self-center'
              >
                {elections.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                <Loader2 className='w-8 h-8 animate-spin mb-2' />
                <p>Loading election data...</p>
              </div>
            ) : elections.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                <p>No elections found. Create one to get started.</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {elections.map(election => {
                  const winner = getWinner(election)
                  return (
                    <div
                      key={election.id}
                      className='p-6 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-semibold text-gray-900'>
                              {election.name}
                            </h3>
                            {getStatusBadge(election.status)}
                          </div>
                          <p className='text-sm text-gray-500 mb-3'>
                            {election.description}
                          </p>
                          <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-3.5 h-3.5' />
                              <span>
                                {new Date(
                                  election.startDate
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(
                                  election.endDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Users className='w-3.5 h-3.5' />
                              <span>
                                {election.candidates.length} Candidates
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Vote className='w-3.5 h-3.5' />
                              <span>
                                {election.totalVotes.toLocaleString()} Votes
                              </span>
                            </div>
                          </div>

                          {/* Candidates List */}
                          {election.candidates.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                              {election.candidates.map(candidate => (
                                <span
                                  key={candidate.id}
                                  className='inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700'
                                >
                                  {candidate.name}
                                  {election.status === 'completed' && (
                                    <span className='ml-1 text-gray-400'>
                                      ({candidate.votes})
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Winner Display */}
                          {winner && (
                            <div className='mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 inline-flex items-center gap-3'>
                              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center'>
                                <Trophy className='w-4 h-4 text-amber-600' />
                              </div>
                              <div>
                                <p className='text-xs text-amber-600 font-medium'>
                                  Winner
                                </p>
                                <p className='font-semibold text-gray-900 text-sm'>
                                  {winner.name}{' '}
                                  <span className='font-normal text-gray-500'>
                                    • {winner.party} •{' '}
                                    {winner.votes.toLocaleString()} votes
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-wrap gap-2 lg:flex-col lg:items-end'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setSelectedElection(election)
                              setShowCandidateModal(true)
                            }}
                            className='border-gray-200 text-gray-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50/60'
                          >
                            <Users className='w-4 h-4 mr-1' />
                            Add Candidate
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setSelectedElection(election)
                              setShowEditModal(true)
                            }}
                            className='border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-300'
                          >
                            <Edit3 className='w-4 h-4 mr-1' />
                            Edit
                          </Button>
                          {election.status === 'draft' && (
                            <Button
                              size='sm'
                              onClick={() => handleStartElection(election.id)}
                              className='bg-teal-600 hover:bg-teal-700 text-white'
                            >
                              Start Election
                              <ChevronRight className='w-4 h-4 ml-1' />
                            </Button>
                          )}
                          {election.status === 'active' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleStopElection(election.id)}
                              className='border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50/80'
                            >
                              <StopCircle className='w-4 h-4 mr-1' />
                              Stop & Announce
                            </Button>
                          )}
                          {election.status === 'completed' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleDeleteElection(election.id)}
                              className='border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300'
                            >
                              <Trash2 className='w-4 h-4 mr-1' />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Election Modal */}
      {showCreateModal && (
        <CreateElectionModal
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          refetchElections={fetchElections}
        />
      )}

      {/* Add Candidate Modal */}
      <AddCandidateModal
        showCandidateModal={showCandidateModal}
        setShowCandidateModal={setShowCandidateModal}
        selectedElection={selectedElection}
        addNewParty={addNewParty}
        setAddNewParty={setAddNewParty}
        selectedParty={selectedParty}
        setSelectedParty={setSelectedParty}
        newParty={newParty}
        setNewParty={setNewParty}
        newCandidate={newCandidate}
        setNewCandidate={setNewCandidate}
        partyList={partyList}
      />

      {/* Edit Election Modal */}
      {showEditModal && selectedElection && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Edit Election
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-teal-700 mb-1.5'>
                  Election Name
                </label>
                <input
                  type='text'
                  defaultValue={selectedElection.name}
                  onChange={e => {
                    setElections(
                      elections.map(el =>
                        el.id === selectedElection.id
                          ? { ...el, name: e.target.value }
                          : el
                      )
                    )
                  }}
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-teal-700 mb-1.5'>
                  Description
                </label>
                <textarea
                  defaultValue={selectedElection.description}
                  onChange={e => {
                    setElections(
                      elections.map(el =>
                        el.id === selectedElection.id
                          ? { ...el, description: e.target.value }
                          : el
                      )
                    )
                  }}
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none'
                  rows={3}
                />
              </div>
              <Button
                onClick={() => setShowEditModal(false)}
                className='w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-full mt-2'
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}