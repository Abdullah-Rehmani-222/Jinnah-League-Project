import { createOrderedContentService } from './orderedContent.service.js'

export const pressService = createOrderedContentService({
  model: 'pressItem',
  label: 'Press item',
  searchFields: ['title', 'description', 'sourceName'],
  include: { mediaAsset: true },
  mediaFields: ['mediaAssetId'],
  imageOnlyFields: [],
  filterFields: ['itemType'],
})
