import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Signal } from '@/components/sections/Signal'
import { Showcase } from '@/components/sections/Showcase'
import { ParticleMorph } from '@/components/sections/ParticleMorph'
import { Void } from '@/components/sections/Void'
import { Frequency } from '@/components/sections/Frequency'
import { Archive } from '@/components/sections/Archive'
import { Finale } from '@/components/sections/Finale'
import { Endpoint } from '@/components/sections/Endpoint'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Signal />
        <Showcase />
        <ParticleMorph />
        <Void />
        <Frequency />
        <Archive />
        <Finale />
        <Endpoint />
      </main>
      <Footer />
    </>
  )
}
