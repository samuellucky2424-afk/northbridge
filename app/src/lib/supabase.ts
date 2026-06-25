import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Checks if Supabase URL and Key are properly configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  const configured = (
    url !== undefined &&
    url !== '' &&
    url !== 'https://placeholder.supabase.co' &&
    key !== undefined &&
    key !== '' &&
    key !== 'placeholder'
  )
  console.log('[NBB Supabase Debug] VITE_SUPABASE_URL:', url)
  console.log('[NBB Supabase Debug] isSupabaseConfigured:', configured)
  return configured
}

/**
 * Retrieve user's email associated with a specific account number.
 * Used for login mapping.
 */
export async function getEmailByAccountNumber(accountNumber: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Simulating email retrieval.')
    return 'sarah.miller@email.com' // Fallback for local demo
  }

  try {
    const { data, error } = await supabase
      .from('profiles_nbb')
      .select('email')
      .eq('account_number', accountNumber)
      .single()

    if (error || !data) {
      console.error('Error fetching email by account number:', error)
      return null
    }

    return data.email
  } catch (err) {
    console.error('Database connection failed:', err)
    return null
  }
}

/**
 * Generates an 8-digit unique registered account number.
 */
export async function generateUniqueAccountNumber(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return Math.floor(10000000 + Math.random() * 90000000).toString()
  }

  let isUnique = false
  let accountNumber = ''
  let attempts = 0

  while (!isUnique && attempts < 10) {
    attempts++
    accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString()
    
    const { data, error } = await supabase
      .from('profiles_nbb')
      .select('id')
      .eq('account_number', accountNumber)
      .maybeSingle()

    if (!data && !error) {
      isUnique = true
    }
  }

  return accountNumber
}

/**
 * Generates a 6-digit random code, saves it to public.otps_nbb, and logs it.
 */
export async function generateAndSendOTP(email: string): Promise<string> {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes expiry

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('otps_nbb')
        .insert([{ email, otp_code: otpCode, expires_at: expiresAt }])
      
      if (error) {
        console.error('Error saving OTP to Supabase:', error)
      }
    } catch (err) {
      console.error('Supabase OTP insert failed:', err)
    }
  }

  // Console logging is required for developer easy testing
  console.log(`%c[NBB OTP CODE] Code generated for ${email}: ${otpCode}`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px;')
  return otpCode
}

/**
 * Verifies if the OTP is correct and not expired.
 */
export async function verifyOTP(email: string, otpCode: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Demo fallback: any matching 6-digit input works if not configured
    return otpCode.length === 6
  }

  try {
    const { data, error } = await supabase
      .from('otps_nbb')
      .select('id, expires_at, verified')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      console.error('Invalid OTP code or already verified')
      return false
    }

    const record = data[0]
    if (new Date(record.expires_at) < new Date()) {
      console.error('OTP has expired')
      return false
    }

    // Mark OTP as verified
    await supabase
      .from('otps_nbb')
      .update({ verified: true })
      .eq('id', record.id)

    return true
  } catch (err) {
    console.error('OTP validation exception:', err)
    return false
  }
}
