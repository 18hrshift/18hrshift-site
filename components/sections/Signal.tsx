import { site } from '@/config/site'

export function Signal() {
  return (
    <section id="signal" className="relative py-36 px-6 md:px-16 max-w-6xl">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">
          {site.signal.label}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue/40 to-transparent" />
      </div>

      {/* Manifesto lines */}
      <div className="space-y-4">
        {site.signal.lines.map((line, i) => (
          <p
            key={i}
            data-reveal
            className="font-display font-black text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.05] tracking-tight text-ink uppercase"
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Blue accent bar */}
      <div className="mt-20 h-px w-24 bg-blue/50" />
    </section>
  )
}
