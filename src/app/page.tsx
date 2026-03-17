import { LandingHero, LandingTop } from '../components/LandingClient'
import BlogPreview from '../components/BlogPreview'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <Navbar />
      <main>
        <LandingHero />
        <BlogPreview />
        <LandingTop />
      </main>
      <Footer />
    </div>
  )
}
