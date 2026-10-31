import Link from 'next/link'
import type { ComponentProps } from 'react'
import { isOtherZone } from '@/lib/zones'

// An internal link that works across zones: <Link> for this app's pages, a plain <a>
// for paths another app serves (the blog).
export function SiteLink({ href, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string }) {
  return isOtherZone(href) ? <a href={href} {...props} /> : <Link href={href} {...props} />
}
