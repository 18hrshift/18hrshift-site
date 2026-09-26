'use client'

import { useEffect, useRef, useState } from 'react'
import { site } from '@/config/site'

export function Nav() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
      <a className="brand" href="#hero" aria-label="18HRSHIFT home">18HRSHIFT<span aria-hidden="true">✳</span></a>
      <span className="header-note eyebrow">Independent minds.<br />Shared ambition.</span>
      <button ref={buttonRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? 'Close −' : 'Menu +'}</button>
      <nav id="site-navigation" aria-label="Main navigation" className={open ? 'site-nav is-open' : 'site-nav'}>
        {site.nav.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
        <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}
