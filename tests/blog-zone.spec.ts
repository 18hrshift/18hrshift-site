import { test, expect } from '@playwright/test'
import { blogZone } from '@/config/blog-zone'
import { site } from '@/config/site'
import nextConfig from '../next.config'

// The blog is a separate app proxied under /blog. These pin the routing this site
// owns: the rewrite to the blog's origin, rewrite caching off (so an unpublished
// post can't linger in this site's CDN copy), and the blog.18hrshift.com redirect.

test('the blog zone uses this site\'s origin', () => {
  expect(blogZone.siteOrigin).toBe(site.url)
})

test('/blog and everything under it is proxied to the blog app', async () => {
  const rewrites = await nextConfig.rewrites!()
  expect(rewrites).toEqual([
    { source: blogZone.path, destination: `${blogZone.origin}${blogZone.path}` },
    { source: `${blogZone.path}/:path*`, destination: `${blogZone.origin}${blogZone.path}/:path*` },
  ])
})

test('this site never caches the proxied blog responses', async () => {
  const headers = await nextConfig.headers!()
  for (const source of [blogZone.path, `${blogZone.path}/:path*`]) {
    const rule = headers.find((entry) => entry.source === source)
    expect(rule?.headers).toContainEqual({ key: 'x-vercel-enable-rewrite-caching', value: '0' })
  }
})

test('the short host redirects to /blog, keeping the path', async ({ request }) => {
  for (const [path, target] of [['/', `${site.url}${blogZone.path}`], ['/some-post', `${site.url}${blogZone.path}/some-post`]]) {
    const response = await request.get(path, { headers: { host: blogZone.shortHost }, maxRedirects: 0 })
    expect(response.status(), path).toBe(308)
    expect(response.headers()['location'], path).toBe(target)
  }
  // The real host is untouched.
  expect((await request.get('/', { maxRedirects: 0 })).status()).toBe(200)
})
