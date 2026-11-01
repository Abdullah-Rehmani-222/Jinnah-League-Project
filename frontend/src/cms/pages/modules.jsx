import {
  Images, Presentation, Handshake, Newspaper, Share2, FileText, Facebook, Instagram, Twitter, Linkedin, Youtube,
  Github, Send, MessageCircle, Globe, Plus, X, ExternalLink,
} from 'lucide-react'
import { api } from '../lib/api'
import { assetUrl, formatDate, isImageAsset } from '../lib/format'
import { SelectField, TextAreaField, TextField, VisibilityField } from '../ui/Fields'
import { MediaField } from '../ui/MediaPicker'
import Button, { IconButton } from '../ui/Button'
import ContentModule from './ContentModule'

const asset = (a) => (a ? { id: a.id, fileUrl: assetUrl(a), mimeType: a.mimeType, originalName: a.originalName, altText: a.altText } : null)

function Thumb({ asset: a, icon: Icon = FileText }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cms-raised text-cms-faint">
      {a && isImageAsset(a) ? <img src={assetUrl(a)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Icon size={18} />}
    </span>
  )
}
const str = (v) => (typeof v === 'string' ? v.trim() : v)

/* ------------------------------------------------------------------ Gallery */
const galleryConfig = {
  endpoint: '/gallery', title: 'Gallery', Icon: Images, singular: 'Image', plural: 'Images',
  description: 'Photos shown on the public Gallery page. Drag order is controlled with the arrows.',
  emptyText: 'Add photos from past events. You can upload them straight from the picker.',
  searchPlaceholder: 'Search by title or description',
  name: (i) => i.title || i.mediaAsset?.originalName || 'Untitled image',
  subtitle: (i) => i.description,
  thumb: (i) => <Thumb asset={i.mediaAsset} icon={Images} />,
  columns: [],
  blank: { media: null, title: '', description: '', altText: '', status: 'DRAFT' },
  toForm: (i) => ({ media: asset(i.mediaAsset), title: i.title ?? '', description: i.description ?? '', altText: i.mediaAsset?.altText ?? '', status: i.status }),
  validate: (f) => (f.media ? {} : { mediaAssetId: 'Choose an image.' }),
  toPayload: (f) => ({ mediaAssetId: f.media.id, title: str(f.title), description: str(f.description), status: f.status }),
  afterSave: async (f) => {
    if ((f.altText ?? '').trim() !== (f.media.altText ?? '')) await api.patch(`/media/${f.media.id}`, { altText: f.altText.trim() })
  },
  renderForm: ({ form, set, errors }) => (
    <>
      <MediaField label="Image" required value={form.media} error={errors.mediaAssetId} onChange={(media) => set({ media, altText: media?.altText ?? '' })} />
      <TextField label="Title" value={form.title} error={errors.title} onChange={(e) => set({ title: e.target.value })} />
      <TextAreaField label="Description" rows={3} value={form.description} error={errors.description} onChange={(e) => set({ description: e.target.value })} />
      <TextField label="Alternative text" hint="Describes the picture for screen readers. Saved with the image in the Media Library." value={form.altText} onChange={(e) => set({ altText: e.target.value })} />
      <VisibilityField status={form.status} onChange={(status) => set({ status })} />
    </>
  ),
}
export const GalleryManager = () => <ContentModule config={galleryConfig} />

/* ------------------------------------------------------------------ Hero & Sliders */
const heroConfig = {
  endpoint: '/sliders', title: 'Hero & Sliders', Icon: Presentation, singular: 'Slide', plural: 'Slides',
  description: 'Slides for the homepage hero. Visitors see published slides in this order.',
  emptyText: 'Add a slide with a headline, an image and an optional button.',
  searchPlaceholder: 'Search slides',
  dialogSize: 'lg',
  name: (i) => i.title,
  subtitle: (i) => i.subtitle,
  thumb: (i) => <Thumb asset={i.mediaAsset} icon={Presentation} />,
  columns: [{ label: 'Button', hideBelow: true, render: (i) => (i.buttonText ? i.buttonText : '—') }],
  blank: { media: null, title: '', subtitle: '', description: '', buttonText: '', buttonUrl: '', status: 'DRAFT' },
  toForm: (i) => ({ media: asset(i.mediaAsset), title: i.title, subtitle: i.subtitle ?? '', description: i.description ?? '', buttonText: i.buttonText ?? '', buttonUrl: i.buttonUrl ?? '', status: i.status }),
  validate: (f) => ({
    ...(f.title.trim() ? {} : { title: 'Title is required.' }),
    ...(f.buttonUrl.trim() && !f.buttonText.trim() ? { buttonText: 'Add the button label.' } : {}),
  }),
  toPayload: (f) => ({
    title: f.title.trim(), subtitle: str(f.subtitle), description: str(f.description),
    mediaAssetId: f.media?.id ?? null, buttonText: str(f.buttonText), buttonUrl: str(f.buttonUrl), status: f.status,
  }),
  renderForm: ({ form, set, errors }) => (
    <>
      <div className="relative overflow-hidden rounded-lg border border-cms-border bg-cms-input" aria-label="Slide preview">
        <div className="flex aspect-[21/8] items-end bg-cover bg-center p-4" style={form.media ? { backgroundImage: `url(${assetUrl(form.media)})` } : undefined}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
          <div className="relative">
            <p className="text-lg font-semibold text-white">{form.title || 'Slide title'}</p>
            {form.subtitle && <p className="text-sm text-slate-200">{form.subtitle}</p>}
            {form.buttonText && <span className="mt-2 inline-block rounded-md bg-cms-accent px-3 py-1 text-xs font-medium text-white">{form.buttonText}</span>}
          </div>
        </div>
      </div>
      <MediaField label="Slide image" value={form.media} error={errors.mediaAssetId} onChange={(media) => set({ media })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" required value={form.title} error={errors.title} onChange={(e) => set({ title: e.target.value })} />
        <TextField label="Subtitle" value={form.subtitle} error={errors.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
      </div>
      <TextAreaField label="Description" rows={3} value={form.description} error={errors.description} onChange={(e) => set({ description: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Button label" placeholder="Register now" value={form.buttonText} error={errors.buttonText} onChange={(e) => set({ buttonText: e.target.value })} />
        <TextField label="Button link" placeholder="#/jl26 or https://…" hint="Use #/page for pages on this site." value={form.buttonUrl} error={errors.buttonUrl} onChange={(e) => set({ buttonUrl: e.target.value })} />
      </div>
      <VisibilityField status={form.status} onChange={(status) => set({ status })} />
    </>
  ),
}
export const HeroManager = () => <ContentModule config={heroConfig} />

/* ------------------------------------------------------------------ Sponsors */
function BenefitsEditor({ value, onChange, error }) {
  const update = (i, v) => onChange(value.map((b, idx) => (idx === i ? v : b)))
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-cms-text">Benefits</span>
      {value.length === 0 && <p className="text-xs text-cms-faint">No benefits added yet.</p>}
      {value.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder="e.g. Logo on all event materials"
            aria-label={`Benefit ${i + 1}`}
            className="h-9 min-w-0 flex-1 rounded-lg border border-cms-border bg-cms-input px-3 text-sm text-cms-text placeholder:text-cms-faint focus:border-cms-accent focus:outline-none focus:ring-2 focus:ring-cms-accent/40"
          />
          <IconButton icon={X} label={`Remove benefit ${i + 1}`} onClick={() => onChange(value.filter((_, idx) => idx !== i))} />
        </div>
      ))}
      <Button size="sm" icon={Plus} onClick={() => onChange([...value, ''])}>Add benefit</Button>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

const sponsorConfig = {
  endpoint: '/sponsors', title: 'Sponsors', Icon: Handshake, singular: 'Tier', plural: 'Tiers',
  description: 'Sponsorship tiers shown on the Sponsors page, with their benefits.',
  emptyText: 'Add a tier such as Gold or Silver and list what sponsors receive.',
  searchPlaceholder: 'Search tiers',
  name: (i) => i.name,
  subtitle: (i) => i.description,
  thumb: (i) => <Thumb asset={i.logoMedia} icon={Handshake} />,
  columns: [{ label: 'Benefits', hideBelow: true, render: (i) => i.benefits.length }],
  blank: { name: '', description: '', benefits: [], logo: null, status: 'DRAFT' },
  toForm: (i) => ({ name: i.name, description: i.description ?? '', benefits: i.benefits ?? [], logo: asset(i.logoMedia), status: i.status }),
  validate: (f) => (f.name.trim() ? {} : { name: 'Tier name is required.' }),
  toPayload: (f) => ({
    name: f.name.trim(), description: str(f.description), benefits: f.benefits.map((b) => b.trim()).filter(Boolean),
    logoMediaId: f.logo?.id ?? null, status: f.status,
  }),
  renderForm: ({ form, set, errors }) => {
    const benefitError = Object.entries(errors).find(([k]) => k.startsWith('benefits'))?.[1]
    return (
      <>
        <TextField label="Tier name" required placeholder="Gold sponsor" value={form.name} error={errors.name} onChange={(e) => set({ name: e.target.value })} />
        <TextAreaField label="Description" rows={3} value={form.description} error={errors.description} onChange={(e) => set({ description: e.target.value })} />
        <BenefitsEditor value={form.benefits} onChange={(benefits) => set({ benefits })} error={benefitError} />
        <MediaField label="Logo" hint="Optional. Shown with this tier." value={form.logo} error={errors.logoMediaId} onChange={(logo) => set({ logo })} />
        <VisibilityField status={form.status} onChange={(status) => set({ status })} />
      </>
    )
  },
}
export const SponsorsManager = () => <ContentModule config={sponsorConfig} />

/* ------------------------------------------------------------------ Media & Press */
const pressTypes = [{ value: 'PRESS_COVERAGE', label: 'Press coverage' }, { value: 'MEDIA_KIT', label: 'Media kit' }]
const pressConfig = {
  endpoint: '/press', title: 'Media & Press', Icon: Newspaper, singular: 'Item', plural: 'Items',
  description: 'Press coverage links and downloadable media kit files.',
  emptyText: 'Add a press article with its link, or upload a media kit PDF.',
  searchPlaceholder: 'Search title, outlet or description',
  dialogSize: 'lg',
  filter: { key: 'itemType', label: 'Filter by type', options: pressTypes },
  name: (i) => i.title,
  subtitle: (i) => [i.sourceName, i.publishedOn && formatDate(i.publishedOn)].filter(Boolean).join(' · '),
  thumb: (i) => <Thumb asset={i.mediaAsset} icon={Newspaper} />,
  columns: [
    { label: 'Type', hideBelow: true, render: (i) => pressTypes.find((t) => t.value === i.itemType)?.label },
    { label: 'Link', hideBelow: true, render: (i) => (i.externalUrl ? <a href={i.externalUrl} target="_blank" rel="noreferrer" aria-label="Open link" className="inline-flex text-cms-accent hover:underline"><ExternalLink size={14} /></a> : '—') },
  ],
  blank: { itemType: 'PRESS_COVERAGE', title: '', sourceName: '', publishedOn: '', description: '', externalUrl: '', media: null, status: 'DRAFT' },
  toForm: (i) => ({ itemType: i.itemType, title: i.title, sourceName: i.sourceName ?? '', publishedOn: i.publishedOn ? i.publishedOn.slice(0, 10) : '', description: i.description ?? '', externalUrl: i.externalUrl ?? '', media: asset(i.mediaAsset), status: i.status }),
  validate: (f) => ({
    ...(f.title.trim() ? {} : { title: 'Title is required.' }),
    ...(f.externalUrl.trim() || f.media ? {} : { externalUrl: 'Add a link or attach a file.' }),
  }),
  toPayload: (f) => ({
    itemType: f.itemType, title: f.title.trim(), sourceName: str(f.sourceName), publishedOn: f.publishedOn,
    description: str(f.description), externalUrl: str(f.externalUrl), mediaAssetId: f.media?.id ?? null, status: f.status,
  }),
  renderForm: ({ form, set, errors }) => (
    <>
      <SelectField label="Type" options={pressTypes} value={form.itemType} error={errors.itemType} onChange={(e) => set({ itemType: e.target.value })} />
      <TextField label="Title" required value={form.title} error={errors.title} onChange={(e) => set({ title: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Outlet or publication" value={form.sourceName} error={errors.sourceName} onChange={(e) => set({ sourceName: e.target.value })} />
        <TextField label="Published on" type="date" value={form.publishedOn} error={errors.publishedOn} onChange={(e) => set({ publishedOn: e.target.value })} />
      </div>
      <TextAreaField label="Summary" rows={3} value={form.description} error={errors.description} onChange={(e) => set({ description: e.target.value })} />
      <TextField label="External link" type="url" placeholder="https://…" value={form.externalUrl} error={errors.externalUrl} onChange={(e) => set({ externalUrl: e.target.value })} />
      <MediaField label="Attached file" kind="any" hint="Optional if you added a link. Images and PDFs are supported." value={form.media} error={errors.mediaAssetId} onChange={(media) => set({ media })} />
      <VisibilityField status={form.status} onChange={(status) => set({ status })} />
    </>
  ),
}
export const PressManager = () => <ContentModule config={pressConfig} />

/* ------------------------------------------------------------------ Social Networks */
const platforms = [
  ['facebook', 'Facebook', Facebook], ['instagram', 'Instagram', Instagram], ['x', 'X (Twitter)', Twitter],
  ['youtube', 'YouTube', Youtube], ['linkedin', 'LinkedIn', Linkedin], ['tiktok', 'TikTok', Globe],
  ['whatsapp', 'WhatsApp', MessageCircle], ['snapchat', 'Snapchat', Globe], ['telegram', 'Telegram', Send],
  ['discord', 'Discord', MessageCircle], ['threads', 'Threads', Globe], ['github', 'GitHub', Github],
]
const platformMeta = Object.fromEntries(platforms.map(([v, l, I]) => [v, { label: l, Icon: I }]))

const socialConfig = {
  endpoint: '/social', title: 'Social Networks', Icon: Share2, singular: 'Link', plural: 'Links',
  description: 'Social media links shown in the website footer. Each platform can have one link.',
  emptyText: 'Add the league’s social profiles so visitors can follow along.',
  searchPlaceholder: 'Search platform or URL',
  name: (i) => platformMeta[i.platform]?.label ?? i.platform,
  subtitle: (i) => i.url,
  thumb: (i) => {
    const Icon = platformMeta[i.platform]?.Icon ?? Globe
    return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cms-raised text-cms-accent"><Icon size={18} /></span>
  },
  columns: [],
  blank: { platform: 'facebook', url: '', status: 'PUBLISHED' },
  toForm: (i) => ({ platform: i.platform, url: i.url, status: i.status }),
  validate: (f) => (f.url.trim() ? {} : { url: 'Enter the profile URL.' }),
  toPayload: (f) => ({ platform: f.platform, url: f.url.trim(), status: f.status }),
  renderForm: ({ form, set, errors }) => (
    <>
      <SelectField label="Platform" options={platforms.map(([value, label]) => ({ value, label }))} value={form.platform} error={errors.platform} onChange={(e) => set({ platform: e.target.value })} />
      <TextField label="Profile URL" required type="url" placeholder="https://…" value={form.url} error={errors.url} onChange={(e) => set({ url: e.target.value })} />
      <VisibilityField label="Enabled" status={form.status} onChange={(status) => set({ status })} hint={form.status === 'PUBLISHED' ? 'Shown in the footer.' : 'Hidden from the footer.'} />
    </>
  ),
}
export const SocialManager = () => <ContentModule config={socialConfig} />
