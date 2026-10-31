import { ok, created } from '../utils/response.js'
import { buildMeta } from '../utils/pagination.js'

export const createCrudController = (service) => ({
  async list(req, res) {
    const { items, total } = await service.list(req.valid.query)
    ok(res, items, undefined, buildMeta(req.valid.query, total))
  },
  async get(req, res) {
    ok(res, await service.get(req.valid.params.id))
  },
  async create(req, res) {
    created(res, await service.create(req.valid.body), `${service.label} created successfully.`)
  },
  async update(req, res) {
    ok(res, await service.update(req.valid.params.id, req.valid.body), `${service.label} updated successfully.`)
  },
  async remove(req, res) {
    await service.remove(req.valid.params.id)
    ok(res, null, `${service.label} deleted successfully.`)
  },
  async reorder(req, res) {
    await service.reorder(req.valid.body.ids)
    ok(res, null, 'Order updated successfully.')
  },
})
