import { auth } from './firebase'

export async function changeUserEmail(uid: string, email: string, expectedEmail: string, syncLoginEmail = false): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Sign in as an administrator to change email addresses.')
  const response = await fetch('/api/admin-change-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({ uid, email, expectedEmail, syncLoginEmail }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || typeof result?.email !== 'string') {
    throw new Error(result?.error || 'The email-change service is unavailable. Try again later.')
  }
  return result.email
}
