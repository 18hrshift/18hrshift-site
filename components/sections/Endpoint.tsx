import { site } from '@/config/site'

export function Endpoint() {
  return (
    <section id="contact" className="contact section-shell" aria-labelledby="contact-title">
      <div className="eyebrow"><i className="status-dot" /> For the next big what if.</div>
      <div className="contact-row"><h2 id="contact-title">GOT SOMETHING<br /><span>ON YOUR MIND?</span></h2><a className="contact-arrow" href={`mailto:${site.endpoint.email}`} aria-label={`Start a conversation at ${site.endpoint.email}`}>↗</a></div>
      <div className="contact-bottom"><p>Let’s make something worth staying up for.</p><a href={`mailto:${site.endpoint.email}`}>{site.endpoint.email} ↗</a></div>
    </section>
  )
}
