import { LandingHero, LandingTop, LandingContacts } from '../components/LandingClient'
import BlogPreview from '../components/BlogPreview'
import TeacherSection from '../components/TeacherSection'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getTeacherProfile } from './actions'

export default async function HomePage() {
  const teacher = await getTeacherProfile()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800">
      <Navbar />
      <main>
        <LandingHero />
        <BlogPreview />
        <LandingTop />
        <TeacherSection
          name={teacher.name}
          bio={teacher.bio}
          photoUrl={teacher.photoUrl}
          badges={teacher.badges.split(',').map(b => b.trim()).filter(Boolean)}
        />
        <LandingContacts />
      </main>
      <Footer />
    </div>
  )
}
