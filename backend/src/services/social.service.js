import { createOrderedContentService } from './orderedContent.service.js'

export const socialService = createOrderedContentService({
  model: 'socialLink',
  label: 'Social link',
  searchFields: ['platform', 'url'],
  include: undefined,
  mediaFields: [],
  imageOnlyFields: [],
})
