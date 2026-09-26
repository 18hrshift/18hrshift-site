import { site } from '@/config/site'

export function Footer() {
  return (
    <footer className="site-footer section-shell">
      <div className="footer-top eyebrow"><span>© {new Date().getFullYear()} 18HRSHIFT</span><span>Always a work in progress.</span><div>{site.endpoint.socials.map((social) => <a href={social.href} key={social.href} target="_blank" rel="noreferrer">{social.label} ↗</a>)}<a href="#hero">Back to top ↑</a></div></div>
      <div className="footer-wordmark" aria-hidden="true">18HRSHIFT<span>✳</span></div>
    </footer>
  )
}
