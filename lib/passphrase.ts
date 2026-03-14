// Simple SHA-256 hash of the passphrase → used as player ID
export async function hashPassphrase(passphrase: string): Promise<string> {
  const normalized = passphrase.trim().toLowerCase()
  const encoded = new TextEncoder().encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function normalizePassphrase(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function validatePassphrase(raw: string): string | null {
  const cleaned = normalizePassphrase(raw)
  if (cleaned.length < 4) return 'Passphrase must be at least 4 characters'
  if (cleaned.length > 100) return 'Passphrase too long'
  return null
}
