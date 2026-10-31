import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'

/** Writes files to a local folder. For development/tests — Render/Railway disks are ephemeral. */
export function createLocalStorage({ dir, publicBaseUrl }) {
  const root = path.resolve(dir)
  return {
    name: 'local',
    root,
    async put({ key, buffer }) {
      await mkdir(root, { recursive: true })
      await writeFile(path.join(root, key), buffer, { flag: 'wx' })
      return { url: `${publicBaseUrl}/uploads/${key}` }
    },
    async remove(key) {
      await unlink(path.join(root, key)).catch((e) => { if (e.code !== 'ENOENT') throw e })
    },
  }
}
