import Link from 'next/link'
import { site } from '@/config/site'
import { ExternalLink } from '@/components/ui/primitives'

// Every page is reachable from here, so the site works even where the mobile menu can't open.
export function Footer() {
  return (
    <footer className="site-footer section-shell">
      <div className="footer-top eyebrow">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span className="footer-note">{site.footerNote}</span>
        <nav aria-label="Footer" className="footer-links">
          <Link href="/">{site.homeLabel}</Link>
          {site.nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <ExternalLink href={site.github}>GitHub ↗</ExternalLink>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </nav>
      </div>
      <div className="footer-wordmark" aria-hidden="true">{site.name}<span>✳</span></div>
    </footer>
  )
}
