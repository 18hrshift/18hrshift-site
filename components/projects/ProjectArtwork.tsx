import Image from 'next/image'
import SystemArtwork from './SystemArtwork'
import { Equalizer } from '@/components/ui/primitives'
import type { Project } from '@/config/projects'
import { projectCopy } from '@/config/site'

// Artwork for projects that aren't games. A project with a live site shows a real
// capture of it; Embersave and Hairraiser use their own brand assets; the podcast,
// Marginalia, the fan translation and the systems use illustrations.
export default function ProjectArtwork({ project }: { project: Project }) {
  if (project.kind === 'System') return <SystemArtwork id={project.id} />

  if (project.capture) {
    return (
      <div className="project-art project-art--capture">
        <Image src={project.capture.src} alt={project.capture.alt} fill sizes="(max-width: 760px) 92vw, 50vw" />
        <span className="eyebrow project-capture-label">{projectCopy.captureLabel}</span>
      </div>
    )
  }

  switch (project.id) {
    case 'embersave':
      return (
        <div className="project-art project-art--embersave" aria-hidden="true">
          <div className="ember-orbit ember-orbit--one" />
          <div className="ember-orbit ember-orbit--two" />
          <div className="ember-orbit ember-orbit--three" />
          <div className="ember-spark ember-spark--one" />
          <div className="ember-spark ember-spark--two" />
          <span className="project-art-corner">KEEP THE WORLD ALIVE</span>
          <Image className="ember-mark" src="/projects/embersave-mark.svg" alt="" width={310} height={310} />
          <Image className="ember-lockup" src="/projects/embersave-lockup.svg" alt="" width={440} height={104} />
          <span className="project-art-footnote">YOUR WORLD. YOUR FRIENDS. YOUR TURN.</span>
        </div>
      )
    case 'hairraiser':
      return (
        <div className="project-art project-art--hairraiser" aria-hidden="true">
          <span className="project-art-corner">A LITTLE SUPPORT GOES A LONG WAY.</span>
          <div className="hairraiser-orbit" />
          <div className="hairraiser-photo">
            <Image src="/projects/hairraiser-portrait.jpg" alt="" fill sizes="(max-width: 700px) 48vw, 24vw" />
          </div>
          <Image className="hairraiser-wordmark" src="/projects/hairraiser-wordmark.svg" alt="" width={450} height={151} />
          <span className="hairraiser-star">✦</span>
          <span className="project-art-footnote">FUND YOUR COMEBACK.</span>
        </div>
      )
    case 'aah':
      return (
        <div className="project-art project-art--aah" aria-hidden="true">
          <span className="project-art-corner">ON AIR</span>
          <div className="aah-wordmark"><span>Andrew</span><span>Asks How</span></div>
          <Equalizer bars={24} className="aah-wave" />
          <span className="project-art-footnote">LONG-FORM INTERVIEWS</span>
        </div>
      )
    case 'marginalia':
      return (
        <div className="project-art project-art--marginalia" aria-hidden="true">
          <span className="project-art-corner">BOOK ILLUSTRATOR</span>
          <div className="marginalia-book">
            <div className="marginalia-page"><span /><span /><span /><span /><span /><span /></div>
            <div className="marginalia-page marginalia-page--art"><span className="marginalia-sun" /><span className="marginalia-hill" /></div>
          </div>
          <div className="marginalia-wordmark">Marginalia</div>
          <span className="project-art-footnote">ILLUSTRATION</span>
        </div>
      )
    case 'ouran':
      return (
        <div className="project-art project-art--ouran" aria-hidden="true">
          <span className="project-art-corner">FAN TRANSLATION / NINTENDO DS</span>
          <div className="ouran-handheld">
            <div className="ouran-screen"><span>JP</span></div>
            <div className="ouran-screen ouran-screen--en"><span>EN</span><i /><i /><i /></div>
          </div>
          <span className="project-art-footnote">ILLUSTRATION</span>
        </div>
      )
    default:
      throw new Error(`No artwork for project "${project.id}".`)
  }
}
