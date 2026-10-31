import * as contact from '../services/contact.service.js'
import { ok, created } from '../utils/response.js'
import { buildMeta } from '../utils/pagination.js'

const THANKS = 'Thank you! Your message has been sent.'

export async function submit(req, res) {
  // Honeypot filled in => pretend success, store nothing.
  if (req.valid.body.website) return created(res, null, THANKS)
  await contact.submit(req.valid.body)
  created(res, null, THANKS)
}
export const list = async (req, res) => {
  const { items, total } = await contact.list(req.valid.query)
  ok(res, items, undefined, buildMeta(req.valid.query, total))
}
export const get = async (req, res) => ok(res, await contact.get(req.valid.params.id))
export const setStatus = async (req, res) => ok(res, await contact.setStatus(req.valid.params.id, req.valid.body.status), 'Message updated successfully.')
export const remove = async (req, res) => {
  await contact.remove(req.valid.params.id)
  ok(res, null, 'Message deleted successfully.')
}
