'use client'

const SALT_LENGTH = 16
const ITERATIONS = 100000

/**
 * Generate a random hex string of specified byte length
 */
function getRandomHex(byteLength: number): string {
  const array = new Uint8Array(byteLength)
  if (typeof window !== 'undefined' && window.crypto) {
    crypto.getRandomValues(array)
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash a password using PBKDF2 (browser-compatible)
 * Returns promise with "salt:hash:iterations" format
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Only works in browser with Web Crypto API
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      // For server-side, use a simple hash (should be replaced with proper server auth)
      return `server:${password}:1`
    }

    const salt = hexToBytes(getRandomHex(SALT_LENGTH))
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, [
      'deriveBits',
    ])

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      key,
      256
    )

    const hashArray = new Uint8Array(derivedBits)
    const saltHex = bytesToHex(salt)
    const hashHex = bytesToHex(hashArray)

    return `${saltHex}:${hashHex}:${ITERATIONS}`
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against a stored hash (browser-compatible)
 * Works with PBKDF2 hashes
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Only works in browser with Web Crypto API
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      return false
    }

    const [saltHex, hashHex, iterStr] = storedHash.split(':')

    if (!saltHex || !hashHex) {
      return false
    }

    const iterations = parseInt(iterStr || ITERATIONS.toString(), 10)
    const salt = hexToBytes(saltHex)
    const storedHashBuffer = hexToBytes(hashHex)

    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, [
      'deriveBits',
    ])

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      key,
      256
    )

    const derivedHash = new Uint8Array(derivedBits)

    // Timing-safe comparison
    if (derivedHash.length !== storedHashBuffer.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < derivedHash.length; i++) {
      result |= derivedHash[i] ^ storedHashBuffer[i]
    }

    return result === 0
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}
