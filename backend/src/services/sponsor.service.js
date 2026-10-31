import { createOrderedContentService } from './orderedContent.service.js'

export const sponsorService = createOrderedContentService({
  model: 'sponsorTier',
  label: 'Sponsorship tier',
  searchFields: ['name', 'description'],
  include: { logoMedia: true },
  mediaFields: ['logoMediaId'],
  imageOnlyFields: ['logoMediaId'],
})
