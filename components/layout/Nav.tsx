'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useMagnetic } from '@/hooks/useMagnetic'
import { site } from '@/config/site'

function MagneticLink({ href, label }: { href: string; label: string }) {
  const ref = useMagnetic<HTMLAnchorElement>(0.32)
  return (
    <Link
      ref={ref}
      href={href}
      className="font-mono text-[10px] text-muted hover:text-blue transition-colors tracking-[0.35em] inline-block"
      data-magnetic
    >
      {label}
    </Link>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const monogramRef = useMagnetic<HTMLAnchorElement>(0.45)

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
        ref={monogramRef}
        href="#hero"
        className="font-mono text-blue text-sm tracking-[0.25em] text-glow-blue inline-block"
        data-magnetic
      >
        {site.monogram}
      </Link>

      <ul className="flex gap-8">
        {site.nav.map((item) => (
          <li key={item.href}>
            <MagneticLink href={item.href} label={item.label} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
