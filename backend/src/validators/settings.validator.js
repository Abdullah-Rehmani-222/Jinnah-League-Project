import { z } from 'zod'
import { optText, optUuid } from './common.validator.js'

const emptyToNull = (v) => (v === '' ? null : v)
const email = z.preprocess(emptyToNull, z.email('Enter a valid email address.').max(255).nullable().optional())

/** Allowed website settings. Unknown keys are rejected, so the table cannot be filled with arbitrary data. */
export const SETTINGS = {
  site_name: { group: 'general', schema: optText(100) },
  tagline: { group: 'general', schema: optText(200) },
  contact_email: { group: 'contact', schema: email },
  contact_phone: { group: 'contact', schema: optText(40) },
  contact_address: { group: 'contact', schema: optText(300) },
  footer_text: { group: 'footer', schema: optText(300) },
  copyright_text: { group: 'footer', schema: optText(200) },
  default_meta_title: { group: 'seo', schema: optText(200) },
  default_meta_description: { group: 'seo', schema: optText(320) },
  logo: { group: 'branding', media: true, schema: optUuid },
  favicon: { group: 'branding', media: true, schema: optUuid },
}

export const settingsUpdateBody = z.object({
  settings: z
    .object(Object.fromEntries(Object.entries(SETTINGS).map(([k, d]) => [k, d.schema])))
    .strict()
    .refine((o) => Object.keys(o).length > 0, 'Nothing to update.'),
})
