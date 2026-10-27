'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { site } from '@/config/site'

export function Nav() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', dismiss)
    return () => window.removeEventListener('keydown', dismiss)
  }, [open])

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={`${site.name} home`}>{site.name}<span aria-hidden="true">✳</span></Link>
      <span className="header-note eyebrow">{site.headerNote[0]}<br />{site.headerNote[1]}</span>
      <button ref={buttonRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? site.menu.close : site.menu.open}</button>
      <nav id="site-navigation" aria-label="Main navigation" className={open ? 'site-nav is-open' : 'site-nav'}>
        {site.nav.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}</Link>
        ))}
        <Link className="nav-contact" href={site.contactLink.href} onClick={() => setOpen(false)}>{site.contactLink.label} <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  )
}
