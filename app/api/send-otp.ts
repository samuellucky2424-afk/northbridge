/* eslint-disable @typescript-eslint/no-explicit-any */
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || ''
const RESEND_FROM = process.env.RESEND_FROM || 'North Bridge Bank <onboarding@resend.dev>'
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyBtUtokjQfOvRlKaXioYz-4BevOSnj6h4w'

function sendJson(res: any, status: number, payload: Record<string, unknown>) {
  res.status(status).json(payload)
}

function parseBearerToken(req: any) {
  const authHeader = String(req.headers.authorization || '')
  if (!authHeader.startsWith('Bearer ')) return ''
  return authHeader.slice('Bearer '.length).trim()
}

async function getFirebaseTokenEmail(idToken: string): Promise<string> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )

  if (!response.ok) return ''
  const data = await response.json()
  return String(data?.users?.[0]?.email || '').toLowerCase()
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' })
    return
  }

  if (!RESEND_API_KEY) {
    sendJson(res, 500, { error: 'Resend API key is not configured.' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    sendJson(res, 400, { error: 'Invalid OTP request.' })
    return
  }
  const email = String(body.email || '').trim().toLowerCase()
  const code = String(body.code || '').trim()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{8}$/.test(code)) {
    sendJson(res, 400, { error: 'Invalid OTP request.' })
    return
  }

  const tokenEmail = await getFirebaseTokenEmail(parseBearerToken(req))
  if (!tokenEmail || tokenEmail !== email) {
    sendJson(res, 401, { error: 'Unauthorized OTP request.' })
    return
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [email],
      subject: 'Your North Bridge Bank transfer code',
      text: `Your North Bridge Bank verification code is ${code}. This code expires in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0A1628">
          <h2>Your transfer verification code</h2>
          <p>Use this code to continue your North Bridge Bank transaction:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
          <p>This code expires in 10 minutes. If you did not request it, please ignore this email.</p>
        </div>
      `,
      tags: [{ name: 'category', value: 'transfer_otp' }],
    }),
  })

  if (!resendResponse.ok) {
    const resendBody = await resendResponse.json().catch(() => null)
    const resendMessage = String(resendBody?.message || resendBody?.error || '').trim()
    sendJson(res, 502, {
      error: resendMessage || 'Unable to send verification email.',
      providerStatus: resendResponse.status,
    })
    return
  }

  sendJson(res, 200, { ok: true })
}
