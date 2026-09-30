import { collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export const DEFAULT_TRANSFER_COUNTRIES = [
  'Turkey', 'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Spain', 'Netherlands',
  'Australia', 'UAE', 'Nigeria', 'India', 'China', 'Japan', 'Brazil', 'South Africa',
  'Italy', 'Ireland', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium',
  'Austria', 'Portugal', 'Greece', 'Poland', 'Singapore', 'Hong Kong', 'New Zealand', 'Mexico',
  'Argentina', 'Chile', 'Colombia', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Saudi Arabia',
  'Qatar', 'Kuwait', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'South Korea', 'Pakistan',
  'Bangladesh', 'Philippines', 'Iran',
]

export function normalizeCountry(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ')
}

function countryKey(name: string): string {
  return normalizeCountry(name).toLocaleLowerCase('en')
}

export function mergeTransferCountries(custom: string[]): string[] {
  const names = new Map<string, string>()
  for (const name of [...DEFAULT_TRANSFER_COUNTRIES, ...custom]) {
    const normalized = normalizeCountry(name)
    if (normalized && !names.has(countryKey(normalized))) names.set(countryKey(normalized), normalized)
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, 'en'))
}

export function subscribeTransferCountries(onChange: (countries: string[]) => void, onError: (error: Error) => void) {
  return onSnapshot(collection(db, 'transfer_countries'), (snapshot) => {
    const names = snapshot.docs.map((item) => item.data().name).filter((name): name is string => typeof name === 'string')
    onChange(mergeTransferCountries(names))
  }, onError)
}

export async function addTransferCountry(input: string): Promise<string> {
  const name = normalizeCountry(input)
  if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M} .,'’()&-]+$/u.test(name) || !/\p{L}/u.test(name)) {
    throw new Error('Enter a country name between 2 and 80 characters, using letters and punctuation only.')
  }
  const key = countryKey(name)
  if (DEFAULT_TRANSFER_COUNTRIES.some((country) => countryKey(country) === key)) {
    throw new Error('This country is already in the transfer list.')
  }
  const countryRef = doc(db, 'transfer_countries', encodeURIComponent(key))
  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(countryRef)).exists()) throw new Error('This country is already in the transfer list.')
    transaction.set(countryRef, { name, created_at: serverTimestamp() })
  })
  return name
}
