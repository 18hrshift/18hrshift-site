import Image from 'next/image'
import Link from 'next/link'
import { home, labPage } from '@/config/site'
import { DisplayTitle } from '@/components/ui/primitives'

export function LabTeaser() {
  const copy = home.lab
  return (
    <section className="lab-teaser section-shell" aria-labelledby="lab-teaser-title">
      <Link className="lab-teaser-card" href={labPage.path}>
        <figure className="lab-teaser-still">
          <Image src={copy.still.src} alt={copy.still.alt} width={copy.still.width} height={copy.still.height} sizes="(max-width: 760px) 92vw, 55vw" />
          <figcaption className="eyebrow">{copy.stillCaption}</figcaption>
        </figure>
        <div className="lab-teaser-copy">
          <p className="eyebrow section-eyebrow">{copy.eyebrow}</p>
          <h2 id="lab-teaser-title" className="section-title"><DisplayTitle lines={copy.title} /></h2>
          <p>{copy.body}</p>
          <span className="lab-teaser-cta">{copy.link} <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
    </section>
  )
}
