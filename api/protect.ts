export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const pass = (process.env.BASIC_AUTH_PASSWORD || '').trim()
  // If no password configured, allow access
  if (!pass) return serveIndex(req)

  const cookies = parseCookies(req.headers.get('cookie') || '')
  const expected = await tokenFromPass(pass)
  if (cookies['tidbcalc_auth'] === expected) {
    return serveIndex(req)
  }
  // Not authenticated → redirect to /login
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login',
      'Cache-Control': 'no-store',
    },
  })
}

async function tokenFromPass(pass: string): Promise<string> {
  const data = new TextEncoder().encode('tidbcalc::' + pass)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

function parseCookies(header: string) {
  const out: Record<string, string> = {}
  header.split(/;\s*/).forEach(pair => {
    const i = pair.indexOf('=')
    if (i > -1) out[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1))
  })
  return out
}

function serveIndex(req: Request) {
  const url = new URL('/index.html', req.url)
  const headers = new Headers(req.headers)
  headers.set('accept', '*/*')
  return fetch(new Request(url.toString(), { headers, method: 'GET' }))
}
