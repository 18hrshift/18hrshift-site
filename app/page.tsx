import { home } from '@/config/site'
import { pageMetadata } from '@/lib/metadata'
import { homeJsonLd } from '@/lib/structured-data'
import { Hero } from '@/components/home/Hero'
import { TagTicker } from '@/components/home/TagTicker'
import { Players } from '@/components/home/Players'
import { Featured } from '@/components/home/Featured'
import { GamesStrip } from '@/components/home/GamesStrip'
import { LabTeaser } from '@/components/home/LabTeaser'
import { Contact } from '@/components/home/Contact'
import { JsonLd } from '@/components/ui/primitives'
import '@/styles/home.css'
import '@/styles/people.css'
import '@/styles/games.css'
import '@/styles/projects.css'

export const metadata = pageMetadata({ title: home.metaTitle, absoluteTitle: true, description: home.description, path: '/' })

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <TagTicker />
      <Players />
      <Featured />
      <GamesStrip />
      <LabTeaser />
      <Contact />
    </>
  )
}
