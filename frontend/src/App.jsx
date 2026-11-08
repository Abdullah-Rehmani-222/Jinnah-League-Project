import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import AboutAcmPage from './pages/AboutAcmPage'
import AboutMajuPage from './pages/AboutMajuPage'
import TenuresPage from './pages/TenuresPage'
import PreviousSponsorsPage from './pages/PreviousSponsorsPage'
import PreviousPartnersPage from './pages/PreviousPartnersPage'
import PreviousSpeakersPage from './pages/PreviousSpeakersPage'
import LegacyPage from './pages/LegacyPage'
import SponsorsPage from './pages/SponsorsPage'
import ContactPage from './pages/ContactPage'
import GalleryPage from './pages/GalleryPage'
import MediaPage from './pages/MediaPage'
import JL26Page from './pages/JL26Page'
import DynamicPage from './pages/DynamicPage'

// The CMS is code-split so visitors to the public site never download it.
const CmsApp = lazy(() => import('./cms/CmsApp'))

export default function App() {
  return (

    // HashRouter:
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="about/acm-maju" element={<AboutAcmPage />} />
        <Route path="about/maju" element={<AboutMajuPage />} />
        <Route path="about/tenures" element={<TenuresPage />} />
        <Route path="about/previous-sponsors" element={<PreviousSponsorsPage />} />
        <Route path="about/previous-partners" element={<PreviousPartnersPage />} />
        <Route path="about/previous-speakers" element={<PreviousSpeakersPage />} />
        <Route path="legacy" element={<LegacyPage />} />
        <Route path="jl26" element={<JL26Page />} />
        <Route path="sponsors" element={<SponsorsPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="contact" element={<ContactPage />} />
        {/* Pages created in the CMS Pages module, e.g. /#/rules */}
        <Route path=":slug" element={<DynamicPage />} />
      </Route>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0b1324] text-sm text-slate-400">Loading…</div>}>
            <CmsApp />
          </Suspense>
        }
      />
    </Routes>


    // BrowserRouter:
    // <Routes>
    //   <Route element={<Layout />}>
    //     <Route path="/" element={<HomePage />} />
    //     <Route path="/about" element={<AboutPage />} />
    //     <Route path="/legacy" element={<LegacyPage />} />
    //     <Route path="/jl26" element={<JL26Page />} />
    //     <Route path="/sponsors" element={<SponsorsPage />} />
    //     <Route path="/media" element={<MediaPage />} />
    //     <Route path="/gallery" element={<GalleryPage />} />
    //     <Route path="/contact" element={<ContactPage />} />
    //   </Route>
    // </Routes>
  )
}
