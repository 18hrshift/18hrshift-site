import Link from 'next/link'
import { gamesPage, notFoundPage } from '@/config/site'
import { DisplayTitle } from '@/components/ui/primitives'

export default function NotFound() {
  return (
    <section className="page-header not-found section-shell">
      <p className="eyebrow section-eyebrow">404</p>
      <h1 className="page-title"><DisplayTitle lines={notFoundPage.title} /></h1>
      <p className="page-intro">{notFoundPage.body}</p>
      <div className="hero-actions">
        <Link className="button button-accent" href="/">{notFoundPage.home} <span aria-hidden="true">↗</span></Link>
        <Link className="text-link" href={gamesPage.path}>{notFoundPage.games} <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  )
}
