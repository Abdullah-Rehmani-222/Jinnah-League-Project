import * as settings from '../services/settings.service.js'
import { ok } from '../utils/response.js'

export const get = async (_req, res) => ok(res, await settings.getAll())
export const update = async (req, res) => ok(res, await settings.update(req.valid.body.settings), 'Settings saved successfully.')
