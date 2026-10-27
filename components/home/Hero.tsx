import Link from 'next/link'
import { home } from '@/config/site'
import { LettermarkSticker } from '@/components/brand/Lettermark'
import { DisplayTitle, Equalizer } from '@/components/ui/primitives'

export function Hero() {
  const { hero } = home
  return (
    <section className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-topline eyebrow">
        <span className="hero-now"><Equalizer /> {hero.eyebrow}</span>
        <span>{hero.credit}</span>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title"><DisplayTitle lines={hero.title} /></h1>
          <p className="hero-body">{hero.body}</p>
          <div className="hero-actions">
            <Link className="button button-accent" href={hero.primary.href}>{hero.primary.label} <span aria-hidden="true">↗</span></Link>
            <a className="text-link" href={hero.secondary.href}><span className="play-icon" aria-hidden="true">↓</span> {hero.secondary.label}</a>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <LettermarkSticker className="hero-sticker" />
        </div>
      </div>
    </section>
  )
}
