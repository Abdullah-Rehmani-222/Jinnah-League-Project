/** Only these user fields ever leave the API — never password_hash. */
export const toPublicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  profileImageUrl: u.profileImageUrl ?? null,
  lastLoginAt: u.lastLoginAt ?? null,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
})
