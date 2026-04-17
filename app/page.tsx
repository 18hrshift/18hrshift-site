import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Signal } from '@/components/sections/Signal'
import { Showcase } from '@/components/sections/Showcase'
import { Archive } from '@/components/sections/Archive'
import { Endpoint } from '@/components/sections/Endpoint'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Signal />
        <Showcase />
        <Archive />
        <Endpoint />
      </main>
      <Footer />
    </>
  )
}
