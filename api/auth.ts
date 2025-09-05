export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const pass = (process.env.BASIC_AUTH_PASSWORD || '').trim()
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  if (!pass) return new Response(null, { status: 204 })

  try {
    const contentType = req.headers.get('content-type') || ''
    let provided = ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      provided = (body?.password || '').toString()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData()
      provided = (form.get('password') || '').toString()
    } else {
      const text = await req.text()
      provided = text
    }
    if (provided !== pass) return new Response('Unauthorized', { status: 401 })

    const token = await tokenFromPass(pass)
    const headers = new Headers({ 'Cache-Control': 'no-store' })
    headers.append(
      'Set-Cookie',
      `tidbcalc_auth=${token}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
    )
    return new Response(null, { status: 204, headers })
  } catch {
    return new Response('Bad Request', { status: 400 })
  }
}

async function tokenFromPass(pass: string): Promise<string> {
  const data = new TextEncoder().encode('tidbcalc::' + pass)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

