'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
import axios from 'axios'

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
  election_id: number
  party_name: string
  party_symbol: string
}

interface UserStats {
  elections_participated: number
  active_elections: number
  total_elections: number
}

interface DashboardData {
  voter: Voter | null
  votingStatus: any[]
  activeElections: Election[]
  pastElections: Election[]
  userStats: UserStats
  candidates: Candidate[]
}

export default function DashboardUI ({ data }: { data: DashboardData }) {
  const displayData = data
  const hasVoted = displayData.votingStatus?.length > 0

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center'>
                <Vote className='w-5 h-5 text-white' />
              </div>
              <div>
                <h1 className='font-semibold text-gray-900'>
                  National Voting Portal
                </h1>
                <p className='text-xs text-gray-500'>
                  Secure Electronic Voting
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-transparent'
              asChild
            >
              <Link href='/'>
                <LogOut className='w-4 h-4 mr-2' />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                Welcome, {displayData.voter?.name || 'Voter'}
              </h2>
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                <div className='flex items-center gap-1.5'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                  <span>Region: {displayData.voter?.region_name || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  {hasVoted ? (
                    <>
                      <CheckCircle2 className='w-4 h-4 text-emerald-500' />
                      <span className='text-emerald-600'>Already Voted</span>
                    </>
                  ) : (
                    <>
                      <Clock className='w-4 h-4 text-amber-500' />
                      <span className='text-amber-600'>Active Voter</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant='outline'
              className='self-start md:self-center border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1'
            >
              <Shield className='w-3.5 h-3.5 mr-1.5' />
              Verified Voter
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
          <Card className='border-gray-200'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Elections Participated
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {displayData.userStats?.elections_participated || 0}
                  </p>
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
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Active Elections
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {displayData.userStats?.active_elections || 0}
                  </p>
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
                  <p className='text-sm font-medium text-gray-500 mb-1'>
                    Total Elections
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {displayData.userStats?.total_elections || 0}
                  </p>
                </div>
                <div className='w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center'>
                  <BarChart3 className='w-6 h-6 text-amber-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Elections */}
        <Card className='border-gray-200 mb-8'>
          <CardHeader className='border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>
                  Elections Available to Vote
                </CardTitle>
                <CardDescription>
                  Cast your vote in ongoing elections
                </CardDescription>
              </div>
              <Badge
                variant='secondary'
                className='bg-emerald-50 text-emerald-700 border-0'
              >
                {displayData.activeElections?.length || 0} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {displayData.activeElections?.length > 0 ? (
              <div className='divide-y divide-gray-100'>
                {displayData.activeElections.map(election => (
                  <div
                    key={election.election_id}
                    className='p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        {election.election_name}
                      </h3>
                      <p className='text-sm text-gray-500 mb-2'>
                        {election.description}
                      </p>
                      <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3.5 h-3.5' />
                          <span>
                            {new Date(election.start_date).toLocaleDateString()}{' '}
                            - {new Date(election.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Users className='w-3.5 h-3.5' />
                          <span>{election.candidate_count} Candidates</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Vote className='w-3.5 h-3.5' />
                          <span>
                            {election.total_votes?.toLocaleString() || 0} Votes
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button className='bg-gray-900 hover:bg-gray-800 text-white shrink-0'>
                      Vote Now
                      <ChevronRight className='w-4 h-4 ml-1' />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-12 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <AlertCircle className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='font-medium text-gray-900 mb-1'>
                  No Active Elections
                </h3>
                <p className='text-sm text-gray-500'>
                  There are no elections available for voting at this time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Elections & Results */}
        <Card className='border-gray-200'>
          <CardHeader className='border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>
                  Past Elections & Results
                </CardTitle>
                <CardDescription>
                  View completed elections and their outcomes
                </CardDescription>
              </div>
              <Badge
                variant='secondary'
                className='bg-gray-100 text-gray-700 border-0'
              >
                {displayData.pastElections?.length || 0} Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {displayData.pastElections?.length > 0 ? (
              <div className='divide-y divide-gray-100'>
                {displayData.pastElections.map(election => (
                  <div
                    key={election.election_id}
                    className='p-6 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-semibold text-gray-900'>
                            {election.election_name}
                          </h3>
                          <Badge
                            variant='outline'
                            className='text-xs border-gray-200 text-gray-500'
                          >
                            Completed
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-500 mb-3'>
                          {election.description}
                        </p>
                        <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-3.5 h-3.5' />
                            <span>
                              Ended:{' '}
                              {new Date(election.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Vote className='w-3.5 h-3.5' />
                            <span>
                              {election.total_votes?.toLocaleString() || 0}{' '}
                              Total Votes
                            </span>
                          </div>
                        </div>
                      </div>
                      {election.winner && (
                        <div className='bg-amber-50 border border-amber-100 rounded-xl p-4 lg:min-w-[280px]'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center'>
                              <Trophy className='w-5 h-5 text-amber-600' />
                            </div>
                            <div>
                              <p className='text-xs text-amber-600 font-medium mb-0.5'>
                                Winner
                              </p>
                              <p className='font-semibold text-gray-900'>
                                {election.winner.candidate_name}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {election.winner.party_name} •{' '}
                                {election.winner.vote_count?.toLocaleString()}{' '}
                                votes
                              </p>
                            </div>
                          </div>
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
                <h3 className='font-medium text-gray-900 mb-1'>
                  No Past Elections
                </h3>
                <p className='text-sm text-gray-500'>
                  Completed elections will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className='border-t border-gray-200 bg-white mt-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-gray-900 rounded flex items-center justify-center'>
                <Vote className='w-3 h-3 text-white' />
              </div>
              <span className='text-sm text-gray-600'>VoteSecure</span>
            </div>
            <p className='text-xs text-gray-400'>
              © 2025 National Voting Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
