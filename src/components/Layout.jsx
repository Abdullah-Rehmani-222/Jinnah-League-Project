import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import SiteBackground from './SiteBackground'

export default function Layout() {
  return (
    <div className="relative isolate min-h-screen flex flex-col">
      <SiteBackground />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
