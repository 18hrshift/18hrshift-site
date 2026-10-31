import { blogZone } from '@/config/blog-zone'

// True for a path that another app (zone) serves under this domain, today only the blog.
// Next's <Link> prefetches and soft-navigates, which can't cross zones, so these need a
// plain <a> and a full page load (Next's multi-zones guide, "Linking between zones").
export function isOtherZone(href: string): boolean {
  return href === blogZone.path || href.startsWith(`${blogZone.path}/`)
}
