import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { pageArgs } from '../utils/pagination.js'

export const submit = ({ name, email, subject, message }) =>
  prisma.contactMessage.create({ data: { name, email, subject: subject ?? null, message }, select: { id: true } })

export async function list(query) {
  const where = {}
  if (query.status) where.status = query.status
  if (query.q)
    where.OR = ['name', 'email', 'subject', 'message'].map((f) => ({ [f]: { contains: query.q, mode: 'insensitive' } }))
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, ...pageArgs(query) }),
    prisma.contactMessage.count({ where }),
  ])
  return { items, total }
}

export async function get(id) {
  const m = await prisma.contactMessage.findUnique({ where: { id } })
  if (!m) throw ApiError.notFound('Message not found.')
  return m
}
export const setStatus = (id, status) => prisma.contactMessage.update({ where: { id }, data: { status } })
export const remove = (id) => prisma.contactMessage.delete({ where: { id } })
