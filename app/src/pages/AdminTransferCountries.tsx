import { useState, type FormEvent } from 'react'
import { Globe, Plus } from 'lucide-react'
import { useTransferCountries } from '../hooks/use-transfer-countries'
import { addTransferCountry } from '../lib/transfer-countries'

export default function AdminTransferCountries() {
  const { countries, loading, error } = useTransferCountries()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSaveError('')
    setSuccess('')
    try {
      const added = await addTransferCountry(name)
      setSuccess(`${added} is now available for international transfers.`)
      setName('')
    } catch (cause) {
      const denied = (cause as { code?: string }).code === 'permission-denied'
      setSaveError(denied ? 'Unable to save. Confirm you are signed in as the administrator and the latest Firestore rules are deployed.' : cause instanceof Error ? cause.message : 'Unable to save this country. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const visibleCountries = countries.filter((country) => country.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-[#0A1628]">Transfer countries</h1>
        <p className="mt-2 text-[#64748B]">Add destinations to the international transfer country list for all customers.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-light rounded-2xl p-6 space-y-4">
        <label htmlFor="transfer-country-name" className="block text-sm font-semibold text-[#0A1628]">Country name</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input id="transfer-country-name" value={name} onChange={(event) => { setName(event.target.value); setSaveError(''); setSuccess('') }} required minLength={2} maxLength={80} disabled={saving} placeholder="e.g. Rwanda" aria-describedby={saveError ? 'country-save-error' : 'country-help'} aria-invalid={!!saveError} className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-light focus:outline-none focus:ring-2 focus:ring-[#610C04]/30" />
          <button type="submit" disabled={saving || loading || !!error || !name.trim()} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Plus size={18} aria-hidden="true" /><span>{saving ? 'Adding…' : 'Add country'}</span></button>
        </div>
        <p id="country-help" className="text-sm text-[#64748B]">Enter any country name. Existing destinations remain available.</p>
        {saveError && <p id="country-save-error" role="alert" className="text-sm text-red-700">{saveError}</p>}
        {success && <p role="status" className="text-sm text-green-700">{success}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
      <section className="bg-white border border-light rounded-2xl p-6 space-y-4" aria-labelledby="available-countries">
        <h2 id="available-countries" className="text-lg font-semibold text-[#0A1628]">Available countries ({countries.length})</h2>
        <label htmlFor="country-search" className="block text-sm font-medium text-[#64748B]">Search countries</label>
        <input id="country-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:max-w-sm px-4 py-3 rounded-xl border border-light focus:outline-none focus:ring-2 focus:ring-[#610C04]/30" />
        {loading && <p role="status" className="text-sm text-[#64748B]">Loading countries…</p>}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleCountries.map((country) => <li key={country} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] text-sm text-[#0A1628]"><Globe size={16} className="shrink-0 text-[#64748B]" aria-hidden="true" /><span>{country}</span></li>)}
        </ul>
        {!visibleCountries.length && <p className="text-sm text-[#64748B]">No countries match your search.</p>}
      </section>
    </div>
  )
}
