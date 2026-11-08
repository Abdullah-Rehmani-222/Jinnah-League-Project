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

// The app is wrapped in <HashRouter> in main.jsx, so URLs look like /#/about/acm-maju
export default function App() {
  return (
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
      </Route>
    </Routes>
  )
}
