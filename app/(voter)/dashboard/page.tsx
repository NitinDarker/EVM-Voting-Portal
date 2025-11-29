'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  Vote,
  LogOut,
  MapPin,
  CheckCircle2,
  Clock,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Shield,
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
import { VoteModal } from '@/components/VoteModal'
import { ResultModal } from '@/components/ResultsModal' // Make sure you created this file!

// --- Types ---
interface Voter {
  voter_id: number
  name: string
  email: string
  region_name: string
}

interface Election {
  election_id: number
  election_name: string
  description: string
  start_date: string
  end_date: string
  status: string
  candidate_count: number
  total_votes: number
  winner?: {
    candidate_id: number
    candidate_name: string
    party_name: string
    vote_count: number
  }
}

interface Candidate {
  candidate_id: number
  candidate_name: string
  party_name: string
  party_symbol?: string
}

interface UserStats {
  elections_participated: number
  active_elections: number
  total_elections: number
}

interface DashboardData {
  voter: Voter | null
  activeElections: Election[]
  pastElections: Election[]
  userStats: UserStats
}

export default function DashboardPage() {
  // --- Dashboard Data State ---
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Vote Modal State ---
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)
  const [modalCandidates, setModalCandidates] = useState<Candidate[]>([])
  const [processingElectionId, setProcessingElectionId] = useState<number | null>(null)

  // --- Result Modal State ---
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [resultElectionId, setResultElectionId] = useState<number | null>(null)

  // --- Fetch Data on Mount ---
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true)

        const [vInfo, vStats, activeE, pastE] = await Promise.all([
          axios.get(`/api/voter/me`, { withCredentials: true }),
          axios.get(`/api/voter/stats`, { withCredentials: true }),
          axios.get(`/api/election/active`),
          axios.get(`/api/election/past`)
        ])

        const rawActive = Array.isArray(activeE.data) ? activeE.data : (activeE.data.elections || [])
        const rawPast = Array.isArray(pastE.data) ? pastE.data : (pastE.data.elections || [])

        const processElection = (e: any): Election => {
          const now = new Date()
          const start = new Date(e.start_date || e.start_time)
          const end = new Date(e.end_date || e.end_time)

          let derivedStatus = 'active'
          if (end < now) derivedStatus = 'completed'
          else if (start > now) derivedStatus = 'upcoming'

          return {
            election_id: e.election_id,
            election_name: e.election_name || e.e_name,
            description: e.description || 'No description',
            start_date: e.start_date || e.start_time,
            end_date: e.end_date || e.end_time,
            status: derivedStatus,
            candidate_count: e.candidate_count || (e.candidates?.length) || 0,
            total_votes: e.total_votes || 0,
            winner: e.winner
          }
        }

        const allElections = [...rawActive, ...rawPast].map(processElection)
        const uniqueElections = Array.from(new Map(allElections.map(item => [item.election_id, item])).values())

        const realActive = uniqueElections.filter(e => e.status === 'active')
        const realPast = uniqueElections.filter(e => e.status === 'completed')

        setData({
          voter: {
            voter_id: vInfo.data.voter_id,
            name: vInfo.data.v_name,
            email: vInfo.data.v_email,
            region_name: vInfo.data.r_name
          },
          activeElections: realActive,
          pastElections: realPast,
          userStats: {
            elections_participated: vStats.data.participated,
            active_elections: realActive.length,
            total_elections: uniqueElections.length
          }
        })
      } catch (e) {
        console.error(e)
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // --- Handlers ---

  const handleVoteClick = async (election: Election) => {
    try {
      setProcessingElectionId(election.election_id)
      const res = await axios.get(`/api/participant/list?election_id=${election.election_id}`)
      
      if (res.data.candidates) {
        setSelectedElection(election)
        setModalCandidates(res.data.candidates)
        setIsVoteModalOpen(true)
      } else {
        alert("No candidates found for this election.")
      }
    } catch (error) {
      console.error("Failed to fetch candidates", error)
      alert("Error loading voting data.")
    } finally {
      setProcessingElectionId(null)
    }
  }

  const handleViewResults = (id: number) => {
    setResultElectionId(id)
    setIsResultModalOpen(true)
  }

  // --- Render ---

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-gray-500 font-medium">Loading Voter Portal...</p>
        </div>
      </div>
    )
  }

  if (!data || error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 text-red-600'>
        <div className="flex items-center gap-2 bg-white p-6 rounded-xl shadow-sm border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Failed to load data'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 animate-in fade-in duration-500'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center'>
                <Vote className='w-5 h-5 text-white' />
              </div>
              <div><h1 className='font-semibold text-gray-900'>EVM Portal</h1></div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'GET' })
                window.location.href = '/'
              }}
              className='border-gray-200 text-gray-600 hover:text-gray-900 bg-transparent'
            >
              <LogOut className='w-4 h-4 mr-2' /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        
        {/* Welcome Section */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>Welcome, {data.voter?.name || 'Voter'}</h2>
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                <div className='flex items-center gap-1.5'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                  <span>Region: {data.voter?.region_name || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-4 h-4 text-amber-500' />
                  <span className='text-amber-600'>Active Voter</span>
                </div>
              </div>
            </div>
            <Badge variant='outline' className='self-start md:self-center border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1'>
              <Shield className='w-3.5 h-3.5 mr-1.5' /> Verified Voter
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
          <Card className='border-gray-200'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>Elections Participated</p>
                  <p className='text-3xl font-bold text-gray-900'>{data.userStats.elections_participated}</p>
                </div>
                <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center'>
                  <Vote className='w-6 h-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='border-gray-200'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>Active Elections</p>
                  <p className='text-3xl font-bold text-gray-900'>{data.userStats.active_elections}</p>
                </div>
                <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center'>
                  <Clock className='w-6 h-6 text-emerald-600' />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className='border-gray-200'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>Total Elections</p>
                  <p className='text-3xl font-bold text-gray-900'>{data.userStats.total_elections}</p>
                </div>
                <div className='w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center'>
                  <BarChart3 className='w-6 h-6 text-amber-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Elections */}
        <Card className='border-gray-200 mb-8'>
          <CardHeader className='border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>Elections Available to Vote</CardTitle>
                <CardDescription>Cast your vote in ongoing elections</CardDescription>
              </div>
              <Badge variant='secondary' className='bg-emerald-50 text-emerald-700 border-0'>
                {data.activeElections.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {data.activeElections.length > 0 ? (
              <div className='divide-y divide-gray-100'>
                {data.activeElections.map(election => (
                  <div key={election.election_id} className='p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1'>{election.election_name}</h3>
                      <p className='text-sm text-gray-500 mb-2'>{election.description}</p>
                      <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3.5 h-3.5' />
                          <span>{new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Users className='w-3.5 h-3.5' />
                          <span>{election.candidate_count} Candidates</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleVoteClick(election)}
                      disabled={processingElectionId === election.election_id}
                      className='bg-gray-900 hover:bg-gray-800 text-white shrink-0 min-w-[120px]'
                    >
                      {processingElectionId === election.election_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Vote Now <ChevronRight className='w-4 h-4 ml-1' /></>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <AlertCircle className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='font-medium text-gray-900 mb-1'>No Active Elections</h3>
                <p className='text-sm text-gray-500'>There are no elections available right now.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Elections */}
        <Card className='border-gray-200'>
          <CardHeader className='border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>Past Elections & Results</CardTitle>
                <CardDescription>View completed elections and outcomes</CardDescription>
              </div>
              <Badge variant='secondary' className='bg-gray-100 text-gray-700 border-0'>
                {data.pastElections.length} Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {data.pastElections.length > 0 ? (
              <div className='divide-y divide-gray-100'>
                {data.pastElections.map(election => (
                  <div key={election.election_id} className='p-6 hover:bg-gray-50 transition-colors'>
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-semibold text-gray-900'>{election.election_name}</h3>
                          <Badge variant='outline' className='text-xs border-gray-200 text-gray-500'>Completed</Badge>
                        </div>
                        <p className='text-sm text-gray-500 mb-3'>{election.description}</p>
                        <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-3.5 h-3.5' />
                            <span>Ended: {new Date(election.end_date).toLocaleDateString()}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Vote className='w-3.5 h-3.5' />
                            <span>{election.total_votes?.toLocaleString() || 0} Votes</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Winner / Results Block */}
                      {election.winner ? (
                        <div className='flex flex-col gap-2 min-w-[280px]'>
                          <div className='bg-amber-50 border border-amber-100 rounded-xl p-4'>
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center'>
                                <Trophy className='w-5 h-5 text-amber-600' />
                              </div>
                              <div>
                                <p className='text-xs text-amber-600 font-medium mb-0.5'>Winner</p>
                                <p className='font-semibold text-gray-900'>{election.winner.candidate_name}</p>
                                <p className='text-xs text-gray-500'>{election.winner.party_name} • {election.winner.vote_count?.toLocaleString()} votes</p>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewResults(election.election_id)}
                            className="w-full border-gray-200 hover:bg-gray-50 text-gray-600"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" /> View Full Analysis
                          </Button>
                        </div>
                      ) : (
                        <div className='bg-gray-50 border border-gray-100 rounded-xl p-4 lg:min-w-[280px] text-center'>
                          <span className="text-sm text-gray-500 italic">Results pending...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Clock className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='font-medium text-gray-900 mb-1'>No Past Elections</h3>
                <p className='text-sm text-gray-500'>Completed elections will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        election={selectedElection}
        candidates={modalCandidates}
        onVoteSuccess={() => window.location.reload()}
      />

      <ResultModal 
        isOpen={isResultModalOpen} 
        onClose={() => setIsResultModalOpen(false)} 
        electionId={resultElectionId} 
      />
    </div>
  )
}