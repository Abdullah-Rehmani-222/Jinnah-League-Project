import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { ToastProvider } from './ui/Toast'
import { Spinner } from './ui/Feedback'
import CmsLayout from './layout/CmsLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'
import AccountPage from './pages/AccountPage'
import PagesListPage from './pages/PagesListPage'
import { CustomPageEditor, JL26Editor, LegacyEditor } from './pages/PageEditor'
import { GalleryManager, HeroManager, PressManager, SocialManager, SponsorsManager } from './pages/modules'

function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading')
    return <div className="flex min-h-screen items-center justify-center bg-cms-bg"><Spinner /></div>
  if (status === 'guest') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Entire CMS lives behind /admin. Loaded lazily from App.jsx so the public site stays light. */
export default function CmsApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<CmsLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="hero" element={<HeroManager />} />
              <Route path="pages" element={<PagesListPage />} />
              <Route path="pages/:id" element={<CustomPageEditor />} />
              <Route path="legacy" element={<LegacyEditor />} />
              <Route path="jl26" element={<JL26Editor />} />
              <Route path="press" element={<PressManager />} />
              <Route path="sponsors" element={<SponsorsManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="media" element={<MediaLibraryPage />} />
              <Route path="social" element={<SocialManager />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
