/**
 * Password hashing via Web Crypto API (SHA-256).
 * Server-side only. For production, upgrade to bcrypt/Argon2.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return (await hashPassword(password)) === storedHash
}
