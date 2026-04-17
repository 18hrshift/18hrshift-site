import { site } from '@/config/site'

export function Endpoint() {
  return (
    <section id="endpoint" className="py-36 px-6 md:px-16">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">ENDPOINT</span>
        <div className="h-px flex-1 bg-gradient-to-r from-magenta/40 to-transparent" />
      </div>

      {/* Terminal prompt + email */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
        <span className="font-mono text-blue text-sm tracking-widest shrink-0">
          {site.endpoint.prompt}
        </span>
        <a
          href={`mailto:${site.endpoint.email}`}
          className="font-display font-black text-[clamp(2rem,6vw,6rem)] leading-none text-ink uppercase hover:text-blue transition-colors duration-300 text-glow-blue"
        >
          {site.endpoint.email}
        </a>
      </div>

      {/* Socials */}
      <div className="flex gap-8 mt-16">
        {site.endpoint.socials.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-muted hover:text-blue transition-colors tracking-[0.4em]"
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="mt-20 h-px w-full bg-surface2" />
    </section>
  )
}
