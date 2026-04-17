import { site } from '@/config/site'

export function Archive() {
  return (
    <section id="archive" className="py-36 px-6 md:px-16">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">ARCHIVE</span>
        <div className="h-px flex-1 bg-gradient-to-r from-magenta/40 to-transparent" />
      </div>

      {/* Perspective container for depth animation */}
      <div className="archive-grid grid grid-cols-2 md:grid-cols-3 gap-px bg-surface2">
        {site.archive.map((item, idx) => (
          <div
            key={item.id}
            className="archive-tile group relative bg-bg p-8 md:p-10 cursor-pointer overflow-hidden transition-colors duration-300 hover:bg-surface"
            style={{ '--tile-index': idx } as React.CSSProperties}
          >
            {/* Hover: glowing border */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 border border-blue/20" />
              <div className="absolute inset-0 bg-blue/[0.025]" />
            </div>

            {/* ID row */}
            <div className="font-mono text-[9px] text-muted mb-6 tracking-widest flex justify-between items-center">
              <span>{item.id}</span>
              <span className="text-magenta/60">{item.code}</span>
            </div>

            {/* Label */}
            <div className="font-display font-black text-2xl md:text-3xl text-ink uppercase leading-tight group-hover:text-blue transition-colors duration-300">
              {item.label}
            </div>

            {/* Year */}
            <div className="font-mono text-[9px] text-muted mt-4 tracking-[0.35em]">
              {item.year}
            </div>

            {/* Magenta bottom slide */}
            <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-magenta/60 transition-all duration-500" />
          </div>
        ))}
      </div>
    </section>
  )
}
