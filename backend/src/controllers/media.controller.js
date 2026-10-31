import * as media from '../services/media.service.js'
import { ok, created } from '../utils/response.js'
import { buildMeta } from '../utils/pagination.js'

export const list = async (req, res) => {
  const { items, total } = await media.list(req.valid.query)
  ok(res, items, undefined, buildMeta(req.valid.query, total))
}
export const get = async (req, res) => ok(res, await media.get(req.valid.params.id))
export const upload = async (req, res) => {
  const asset = await media.upload({ file: req.file, ...req.valid.body, userId: req.user.id })
  created(res, asset, 'File uploaded successfully.')
}
export const update = async (req, res) => ok(res, await media.update(req.valid.params.id, req.valid.body), 'Media updated successfully.')
export const remove = async (req, res) => {
  await media.remove(req.valid.params.id)
  ok(res, null, 'Media deleted successfully.')
}
