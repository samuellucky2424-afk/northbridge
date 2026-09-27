import { auth } from './firebase'

// Profile snapshots can receive an admin's email change before the browser's
// cached Firebase User. Refresh both the user and token before comparing them.
export async function getTransferSession(email: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Your session expired. Please sign in again with your current email address.')

  let idToken: string
  try {
    await user.reload()
    idToken = await user.getIdToken(true)
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === 'auth/network-request-failed') {
      throw new Error('Unable to refresh your session. Check your internet connection and try again.')
    }
    if (code === 'auth/user-disabled') {
      throw new Error('Your account is disabled. Please contact support.')
    }
    throw new Error('Your session expired or your login email changed. Please sign out and sign in again with your current email address.')
  }

  if (auth.currentUser?.uid !== user.uid) {
    throw new Error('Your signed-in account changed. Please reopen the transfer and try again.')
  }
  const currentEmail = user.email?.trim().toLowerCase() || ''
  if (!currentEmail || currentEmail !== email.trim().toLowerCase()) {
    throw new Error('Your profile email does not match your login email. Ask an administrator to complete the email change, then sign in again.')
  }
  return { uid: user.uid, email: currentEmail, idToken }
}
