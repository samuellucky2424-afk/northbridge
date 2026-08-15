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

function generateDepositEmail(amount: number, currencySymbol: string, method: string): { subject: string; html: string } {
  return {
    subject: `Credit Alert: ${currencySymbol}${amount.toFixed(2)} deposited to your account`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0A1628;max-width:600px;margin:0 auto">
        <div style="background:#610C04;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">North Bridge Bank</h1>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h2 style="color:#10B981;margin-top:0">Credit Alert</h2>
          <p>A deposit has been made to your account.</p>
          <div style="background:white;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #e2e8f0">
            <p style="margin:5px 0"><strong>Amount:</strong> <span style="color:#10B981;font-size:20px;font-weight:bold">${currencySymbol}${amount.toFixed(2)}</span></p>
            <p style="margin:5px 0"><strong>Method:</strong> ${method}</p>
            <p style="margin:5px 0"><strong>Status:</strong> <span style="color:#10B981">Completed</span></p>
            <p style="margin:5px 0"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <p style="color:#64748B;font-size:14px">If you did not make this deposit, please contact our support team immediately.</p>
        </div>
        <div style="background:#0A1628;padding:15px;text-align:center">
          <p style="color:#94A3B8;margin:0;font-size:12px">North Bridge Bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority.</p>
        </div>
      </div>
    `,
  }
}

function generateTransferEmail(amount: number, currencySymbol: string, recipient: string, transferType: string): { subject: string; html: string } {
  return {
    subject: `Transfer Confirmation: ${currencySymbol}${amount.toFixed(2)} sent to ${recipient}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0A1628;max-width:600px;margin:0 auto">
        <div style="background:#610C04;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">North Bridge Bank</h1>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h2 style="color:#0A1628;margin-top:0">Transfer Confirmation</h2>
          <p>Your ${transferType} transfer has been submitted for approval.</p>
          <div style="background:white;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #e2e8f0">
            <p style="margin:5px 0"><strong>Amount:</strong> <span style="color:#D31111;font-size:20px;font-weight:bold">${currencySymbol}${amount.toFixed(2)}</span></p>
            <p style="margin:5px 0"><strong>Recipient:</strong> ${recipient}</p>
            <p style="margin:5px 0"><strong>Transfer Type:</strong> ${transferType.charAt(0).toUpperCase() + transferType.slice(1)}</p>
            <p style="margin:5px 0"><strong>Status:</strong> <span style="color:#F59E0B">Pending Approval</span></p>
            <p style="margin:5px 0"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <p style="color:#64748B;font-size:14px">You will receive another notification once your transfer is approved.</p>
        </div>
        <div style="background:#0A1628;padding:15px;text-align:center">
          <p style="color:#94A3B8;margin:0;font-size:12px">North Bridge Bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority.</p>
        </div>
      </div>
    `,
  }
}

function generateSignupEmail(firstName: string): { subject: string; html: string } {
  return {
    subject: `Welcome to North Bridge Bank, ${firstName}!`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0A1628;max-width:600px;margin:0 auto">
        <div style="background:#610C04;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">North Bridge Bank</h1>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h2 style="color:#0A1628;margin-top:0">Welcome to North Bridge Bank!</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for opening an account with North Bridge Bank. We're delighted to welcome you to our banking family.</p>
          <div style="background:white;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #e2e8f0">
            <h3 style="margin-top:0;color:#610C04">Your Account Features:</h3>
            <ul style="padding-left:20px;margin:10px 0">
              <li>Instant notifications for all transactions</li>
              <li>Secure online and mobile banking</li>
              <li>Domestic and international transfers</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
          <p style="color:#64748B;font-size:14px">If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div style="background:#0A1628;padding:15px;text-align:center">
          <p style="color:#94A3B8;margin:0;font-size:12px">North Bridge Bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority.</p>
        </div>
      </div>
    `,
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' })
    return
  }

  if (!RESEND_API_KEY) {
    // In dev mode, just log the notification and return success
    console.log('[DEV MODE] Notification would be sent:', req.body)
    sendJson(res, 200, { ok: true, dev: true })
    return
  }

  let body: Record<string, unknown>
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    sendJson(res, 400, { error: 'Invalid notification request.' })
    return
  }

  const type = String(body.type || '')
  const userId = String(body.userId || '')

  if (!type) {
    sendJson(res, 400, { error: 'Notification type is required.' })
    return
  }

  // Get user email from Firebase token
  let userEmail = ''
  try {
    const idToken = parseBearerToken(req)
    if (idToken) {
      userEmail = await getFirebaseTokenEmail(idToken)
    }
  } catch {
    // Token might not be available in all cases
  }

  // If no email from token, try to get from body
  if (!userEmail) {
    userEmail = String(body.email || '').trim().toLowerCase()
  }

  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    // In dev mode, return success even without email
    console.log('[DEV MODE] No valid email for notification:', body)
    sendJson(res, 200, { ok: true, dev: true, note: 'No valid email provided' })
    return
  }

  let emailContent: { subject: string; html: string }

  switch (type) {
    case 'deposit':
      emailContent = generateDepositEmail(
        Number(body.amount || 0),
        String(body.currencySymbol || '£'),
        String(body.method || 'Deposit')
      )
      break
    case 'transfer':
      emailContent = generateTransferEmail(
        Number(body.amount || 0),
        String(body.currencySymbol || '£'),
        String(body.recipient || 'Recipient'),
        String(body.transferType || 'domestic')
      )
      break
    case 'signup':
      emailContent = generateSignupEmail(String(body.firstName || 'Customer'))
      break
    default:
      sendJson(res, 400, { error: 'Unknown notification type.' })
      return
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [userEmail],
        subject: emailContent.subject,
        html: emailContent.html,
        tags: [{ name: 'category', value: `notification_${type}` }],
      }),
    })

    if (!resendResponse.ok) {
      const resendBody = await resendResponse.json().catch(() => null)
      const resendMessage = String(resendBody?.message || resendBody?.error || '').trim()
      console.error('Resend API error:', resendMessage)
      // Don't fail the request if email fails - notification is already saved
      sendJson(res, 200, { ok: true, emailSent: false, error: resendMessage })
      return
    }

    sendJson(res, 200, { ok: true, emailSent: true })
  } catch (err) {
    console.error('Failed to send email notification:', err)
    // Don't fail the request if email fails
    sendJson(res, 200, { ok: true, emailSent: false })
  }
}
