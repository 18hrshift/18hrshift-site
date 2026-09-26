import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Studio } from '@/components/sections/Studio'
import { Portfolio } from '@/components/sections/Portfolio'
import { Lab } from '@/components/sections/Lab'
import { Universe } from '@/components/sections/Universe'
import { Endpoint } from '@/components/sections/Endpoint'

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Studio />
        <Portfolio />
        <Lab />
        <Universe />
        <Endpoint />
      </main>
      <Footer />
    </>
  )
}
