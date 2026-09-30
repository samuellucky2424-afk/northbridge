import { useEffect, useState } from 'react'
import { mergeTransferCountries, subscribeTransferCountries } from '../lib/transfer-countries'

export function useTransferCountries() {
  const [countries, setCountries] = useState(() => mergeTransferCountries([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => subscribeTransferCountries((names) => {
    setCountries(names)
    setLoading(false)
    setError('')
  }, () => {
    setLoading(false)
    setError('Unable to load additional countries. Please check your connection and try again.')
  }), [])
  return { countries, loading, error }
}
