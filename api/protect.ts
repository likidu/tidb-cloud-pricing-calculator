export const config = { runtime: 'edge' }

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
  })
}

export default async function handler(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const pass = (process.env.BASIC_AUTH_PASSWORD || '').trim()

  // If no credentials configured, allow access
  if (!pass) {
    return await serveIndex(req)
  }

  if (!auth.startsWith('Basic ')) return unauthorized()
  const decoded = atob(auth.slice(6))
  const sep = decoded.indexOf(':')
  const providedPass = sep >= 0 ? decoded.slice(sep + 1) : decoded
  if (providedPass !== pass) return unauthorized()

  return await serveIndex(req)
}

async function serveIndex(req: Request) {
  // Always serve the SPA shell to HTML requests
  const url = new URL('/index.html', req.url)
  const headers = new Headers(req.headers)
  headers.set('accept', '*/*') // avoid routing back into this function
  return fetch(new Request(url.toString(), { headers, method: 'GET' }))
}
