import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LegacyPage from './pages/LegacyPage'
import SponsorsPage from './pages/SponsorsPage'
import ContactPage from './pages/ContactPage'
import GalleryPage from './pages/GalleryPage'
import MediaPage from './pages/MediaPage'
import JL26Page from './pages/JL26Page'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/legacy" element={<LegacyPage />} />
        <Route path="/jl26" element={<JL26Page />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  )
}
