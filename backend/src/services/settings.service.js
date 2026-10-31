import { prisma } from '../config/database.js'
import { SETTINGS } from '../validators/settings.validator.js'
import { assertMediaExists } from './media.service.js'

const mediaView = (a) => (a ? { id: a.id, url: a.fileUrl, altText: a.altText } : null)

/** Every known key is returned (null when unset) so the CMS can always render the full form. */
export async function getAll() {
  const rows = await prisma.websiteSetting.findMany({ include: { mediaAsset: true } })
  const byKey = new Map(rows.map((r) => [r.settingKey, r]))
  const settings = {}
  for (const [key, def] of Object.entries(SETTINGS)) {
    const row = byKey.get(key)
    settings[key] = def.media ? mediaView(row?.mediaAsset) : (row?.settingValue ?? null)
  }
  return settings
}

export async function update(input) {
  const entries = Object.entries(input)
  for (const [key, value] of entries) if (SETTINGS[key].media && value) await assertMediaExists(value, { imageOnly: true, field: `settings.${key}` })

  await prisma.$transaction(
    entries.map(([key, value]) => {
      const def = SETTINGS[key]
      const data = def.media
        ? { settingGroup: def.group, mediaAssetId: value ?? null, settingValue: null }
        : { settingGroup: def.group, settingValue: value ?? null }
      return prisma.websiteSetting.upsert({ where: { settingKey: key }, update: data, create: { settingKey: key, ...data } })
    }),
  )
  return getAll()
}
