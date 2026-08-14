'use client'

import { useMemo, useState } from 'react'
import { site } from '@/config/site'

export function Blog() {
  const { categories, posts } = site.blog
  const [active, setActive] = useState<string>('ALL')

  const filtered = useMemo(
    () => (active === 'ALL' ? posts : posts.filter((p) => p.category === active)),
    [active, posts],
  )

  const tabs = ['ALL', ...categories]

  return (
    <section id="blog" className="py-36 px-6 md:px-16">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">BLOG</span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue/40 to-transparent" />
      </div>

      <div className="font-display font-black text-4xl md:text-6xl text-ink uppercase leading-none mb-2">
        Everything.
      </div>
      <div className="font-mono text-[11px] text-muted tracking-[0.3em] mb-10">
        TECHTECH_ · AI_ · GAMING_ · MEDIA_ · SPORTS_
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-12" role="tablist" aria-label="Blog categories">
        {tabs.map((cat) => {
          const isActive = active === cat
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              aria-selected={isActive}
              className={`font-mono text-[10px] tracking-[0.3em] px-4 py-2 border transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'text-blue border-blue bg-blue/10 text-glow-blue'
                  : 'text-muted border-surface2 hover:text-ink hover:border-muted'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((post, idx) => {
          const accent = idx % 2 === 0 ? 'blue' : 'magenta'
          return (
            <article
              key={post.id}
              className="blog-card group relative bg-surface p-6 md:p-7 cursor-pointer overflow-hidden border border-surface2 transition-colors duration-300 hover:border-blue/25"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-blue/[0.03]" />
              </div>

              {/* Category + read time */}
              <div className="flex items-center justify-between mb-5 font-mono text-[9px] tracking-widest">
                <span className={accent === 'blue' ? 'text-blue' : 'text-magenta'}>
                  {post.category}
                </span>
                <span className="text-muted">{post.read}</span>
              </div>

              {/* Title */}
              <h3 className="font-display font-black text-xl md:text-2xl text-ink uppercase leading-tight group-hover:text-blue transition-colors duration-300 line-clamp-2">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-muted mt-3 leading-relaxed line-clamp-3">{post.excerpt}</p>

              {/* Footer row */}
              <div className="mt-6 pt-4 border-t border-surface2 flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted tracking-[0.3em]">{post.date}</span>
                <span
                  className={`font-mono text-[12px] transition-transform duration-300 group-hover:translate-x-1 ${
                    accent === 'blue' ? 'text-blue' : 'text-magenta'
                  }`}
                >
                  →
                </span>
              </div>

              {/* Bottom cyan slide */}
              <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-blue transition-all duration-500" />
            </article>
          )
        })}
      </div>
    </section>
  )
}