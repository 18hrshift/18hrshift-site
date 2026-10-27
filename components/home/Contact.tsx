import Link from 'next/link'
import { home, site } from '@/config/site'
import { DisplayTitle, ExternalLink } from '@/components/ui/primitives'

export function Contact() {
  const copy = home.contact
  return (
    <section id="contact" className="contact section-shell" aria-labelledby="contact-title">
      <div className="eyebrow contact-eyebrow"><i className="status-dot" /> {copy.eyebrow}</div>
      <div className="contact-row">
        <h2 id="contact-title"><DisplayTitle lines={copy.title} tone="muted" /></h2>
        <a className="contact-arrow" href={`mailto:${site.email}`} aria-label={`${home.contact.emailLabel} ${site.email}`}>↗</a>
      </div>
      <div className="contact-bottom">
        <p>{copy.body}</p>
        <div className="contact-links">
          <a href={`mailto:${site.email}`}>{site.email} <span aria-hidden="true">↗</span></a>
          <ExternalLink href={site.github}>GitHub <span aria-hidden="true">↗</span></ExternalLink>
          <Link href={copy.pileLink.href}>{copy.pileLink.label} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  )
}
