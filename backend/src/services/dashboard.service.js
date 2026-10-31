import { prisma } from '../config/database.js'

/** Real counts straight from the database — nothing is estimated or hard-coded. */
export async function getOverview() {
  const [pages, mediaAssets, galleryItems, contactMessages, unreadMessages, heroSlides, sponsorTiers, pressItems, socialLinks, recentMessages] =
    await Promise.all([
      prisma.page.count(),
      prisma.mediaAsset.count(),
      prisma.galleryItem.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.heroSlide.count(),
      prisma.sponsorTier.count(),
      prisma.pressItem.count(),
      prisma.socialLink.count(),
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, subject: true, status: true, createdAt: true } }),
    ])
  return { counts: { pages, mediaAssets, galleryItems, contactMessages, unreadMessages, heroSlides, sponsorTiers, pressItems, socialLinks }, recentMessages }
}
