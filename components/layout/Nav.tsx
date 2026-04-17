'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { site } from '@/config/site'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 transition-all duration-700 ${
        scrolled
          ? 'bg-surface/80 backdrop-blur-xl border-b border-surface2'
          : 'bg-transparent'
      }`}
    >
      <Link
        href="#hero"
        className="font-mono text-blue text-sm tracking-[0.25em] hover:text-glow-blue transition-all"
      >
        {site.monogram}
      </Link>

      <ul className="flex gap-8">
        {site.nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-mono text-[10px] text-muted hover:text-blue transition-colors tracking-[0.35em]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
