import * as pages from '../services/page.service.js'
import { ok, created } from '../utils/response.js'
import { buildMeta } from '../utils/pagination.js'

// Works for /api/pages/:id/... and for the fixed-page modules (/api/legacy, /api/jl26) that set req.pageId.
const pageId = (req) => req.pageId ?? req.valid.params.id

export const list = async (req, res) => {
  const { items, total } = await pages.list(req.valid.query)
  ok(res, items, undefined, buildMeta(req.valid.query, total))
}
export const get = async (req, res) => ok(res, await pages.get(pageId(req)))
export const create = async (req, res) => created(res, await pages.create(req.valid.body), 'Page created successfully.')
export const update = async (req, res) => ok(res, await pages.update(pageId(req), req.valid.body), 'Page updated successfully.')
export const remove = async (req, res) => {
  await pages.remove(req.valid.params.id)
  ok(res, null, 'Page deleted successfully.')
}

export const listSections = async (req, res) => ok(res, await pages.listSections(pageId(req)))
export const addSection = async (req, res) => created(res, await pages.addSection(pageId(req), req.valid.body), 'Section added successfully.')
export const updateSection = async (req, res) =>
  ok(res, await pages.updateSection(pageId(req), req.valid.params.sectionId, req.valid.body), 'Section updated successfully.')
export const removeSection = async (req, res) => {
  await pages.removeSection(pageId(req), req.valid.params.sectionId)
  ok(res, null, 'Section deleted successfully.')
}
export const reorderSections = async (req, res) => {
  await pages.reorderSections(pageId(req), req.valid.body.ids)
  ok(res, null, 'Section order updated successfully.')
}
