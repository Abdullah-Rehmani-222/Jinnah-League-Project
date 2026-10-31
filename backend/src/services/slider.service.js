import { createOrderedContentService } from './orderedContent.service.js'

export const sliderService = createOrderedContentService({
  model: 'heroSlide',
  label: 'Slide',
  searchFields: ['title', 'subtitle', 'description'],
  include: { mediaAsset: true },
  mediaFields: ['mediaAssetId'],
  imageOnlyFields: ['mediaAssetId'],
})
