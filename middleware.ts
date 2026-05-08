export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    '/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}

export default function middleware(request: Request) {
  const basicAuth = request.headers.get('authorization')

  // Get credentials from environment variables
  const expectedUser = process.env.BASIC_AUTH_USER || 'admin'
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD || 'password'

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === expectedUser && pwd === expectedPassword) {
      return
    }
  }

  // Return 401 with WWW-Authenticate header to trigger browser's basic auth prompt
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}
