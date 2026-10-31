import multer from 'multer'
import { env } from '../config/environment.js'

// Memory storage: the file is validated (type + magic bytes) before anything is written to storage.
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1, fields: 5 },
}).single('file')
