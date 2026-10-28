import type { NextConfig } from 'next'
import { blogZone } from './config/blog-zone'

const { path, origin, shortHost, siteOrigin } = blogZone

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  turbopack: {
    root: __dirname,
  },
  // The blog is a separate app (multi-zones). Proxy its whole basePath to it.
  async rewrites() {
    return [
      { source: path, destination: `${origin}${path}` },
      { source: `${path}/:path*`, destination: `${origin}${path}/:path*` },
    ]
  },
  // Vercel caches external rewrites by default for projects created after
  // 2026-04-06, and a purge in the blog can't reach this site's copy. Turn that
  // off so the blog's own cache, which it clears on publish, is the only one.
  async headers() {
    const noRewriteCaching = [{ key: 'x-vercel-enable-rewrite-caching', value: '0' }]
    return [
      { source: path, headers: noRewriteCaching },
      { source: `${path}/:path*`, headers: noRewriteCaching },
    ]
  },
  // blog.18hrshift.com is a shareable short address for /blog.
  async redirects() {
    const has = [{ type: 'host' as const, value: shortHost }]
    return [
      { source: '/', has, destination: `${siteOrigin}${path}`, permanent: true },
      { source: '/:path+', has, destination: `${siteOrigin}${path}/:path+`, permanent: true },
    ]
  },
}

export default nextConfig
