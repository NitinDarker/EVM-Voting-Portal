import { X } from 'lucide-react'
import { Button } from './ui/button'
import toast from 'react-hot-toast'

export default function AddCandidateModal ({
  showCandidateModal,
  setShowCandidateModal,
  selectedElection,
  addNewParty,
  setAddNewParty,
  selectedParty,
  setSelectedParty,
  newParty,
  setNewParty,
  newCandidate,
  setNewCandidate,
  partyList
}: any) {
  async function handleAddCandidate () {
    try {
      let partyId = selectedParty

      // VALIDATION FIRST — stop sending blank trash
      if (!newCandidate.name.trim())
        return toast.error('Candidate name required')

      if (addNewParty) {
        if (!newParty.name.trim() || !newParty.symbol.trim())
          return toast.error('Party name + symbol required')

        // CREATE PARTY PROPERLY
        const partyRes = await fetch('/api/party/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_name: newParty.name,
            p_symbol: newParty.symbol
          })
        })

        const partyData = await partyRes.json()

        console.log(partyData.party_id[0])
        if (!partyRes.ok || !partyData.party_id) {
          return toast.error('Party creation failed')
        }
        partyId = partyData.party_id[0].party_id
      }

      // NOW CREATE CANDIDATE
      const candidateRes = await fetch('/api/candidate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // 🔥 FIX #2
        body: JSON.stringify({
          c_name: newCandidate.name,
          party_id: partyId
        })
      })

      if (!candidateRes.ok) return toast.error('Candidate creation failed')

      toast.success('Candidate added 🎉')

      // RESET STATE — your modal should not stay dirty like before
      setNewCandidate({ name: '' })
      setNewParty({ name: '', symbol: '' })
      setSelectedParty('')
      setAddNewParty(false)
      setShowCandidateModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  return (
    <>
      {showCandidateModal && selectedElection && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl w-full max-w-lg p-6 space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-xl font-semibold'>Add Candidate</h3>
                <p className='text-sm text-gray-500'>{selectedElection.name}</p>
              </div>
              <button
                onClick={() => setShowCandidateModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            {/* Candidate Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Candidate Name
              </label>
              <input
                type='text'
                value={newCandidate.name}
                onChange={e =>
                  setNewCandidate({ ...newCandidate, name: e.target.value })
                }
                className='w-full px-4 py-3 rounded-xl border-gray-300 border
                     focus:ring-teal-500 focus:border-teal-500'
                placeholder='Enter candidate name'
              />
            </div>

            {/* Party Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Select Party
              </label>

              <select
                value={selectedParty}
                onChange={e => setSelectedParty(e.target.value)}
                className='w-full px-3 py-3 rounded-xl border border-gray-300
                     focus:ring-teal-500 focus:border-teal-500'
              >
                <option value=''>Choose party...</option>
                {partyList?.map((p: any) => (
                  <option key={p.party_id} value={p.party_id}>
                    {p.p_name}
                  </option>
                ))}
              </select>

              {/* Toggle New Party */}
              <button
                className='text-sm text-teal-600 mt-2 underline'
                onClick={() => setAddNewParty(!addNewParty)}
              >
                {addNewParty ? 'Cancel new party' : 'Create new party instead'}
              </button>
            </div>

            {/* New Party Section */}
            {addNewParty && (
              <div className='space-y-4 border rounded-xl p-4 bg-gray-50'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    New Party Name
                  </label>
                  <input
                    type='text'
                    value={newParty.name}
                    onChange={e =>
                      setNewParty({ ...newParty, name: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-xl border-gray-300 border
                         focus:ring-teal-500 focus:border-teal-500'
                    placeholder='Party Name'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Party Symbol URL / File
                  </label>
                  <input
                    type='text'
                    value={newParty.symbol}
                    onChange={e =>
                      setNewParty({ ...newParty, symbol: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-xl border-gray-300 border
                         focus:ring-teal-500 focus:border-teal-500'
                    placeholder='Paste icon URL or upload feature later'
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleAddCandidate}
              variant='dash'
              className='w-full text-white h-12 font-semibold'
            >
              Add Candidate
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
