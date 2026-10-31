import { createOrderedContentService } from './orderedContent.service.js'

export const galleryService = createOrderedContentService({
  model: 'galleryItem',
  label: 'Gallery item',
  searchFields: ['title', 'description'],
  include: { mediaAsset: true },
  mediaFields: ['mediaAssetId'],
  imageOnlyFields: ['mediaAssetId'],
})
