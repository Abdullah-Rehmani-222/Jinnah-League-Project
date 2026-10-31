import argon2 from 'argon2'

// OWASP-recommended Argon2id minimum (19 MiB, 2 iterations, 1 lane) — safe for small hosts.
const options = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 }

export const hashPassword = (plain) => argon2.hash(plain, options)

export const verifyPassword = async (hash, plain) => {
  try {
    return await argon2.verify(hash, plain)
  } catch {
    return false
  }
}

// Verified when an email is unknown so login timing does not reveal which emails exist.
let dummy
export const verifyDummy = async (plain) => {
  dummy ??= await hashPassword('not-a-real-password')
  await verifyPassword(dummy, plain)
}
