// Where the blog lives. The blog is its own app (repo 18hrshift/18hrshift-blog,
// Vercel project 18hrshift-blog) served under this site's /blog through a rewrite.
// next.config.ts reads this file, so it may only import other import-free config.
import { siteOrigin } from './origin'

export const blogZone = {
  // The public path. The blog app uses the same basePath.
  path: '/blog',
  // The blog project's production domain, the rewrite's upstream.
  origin: 'https://18hrshift-blog.vercel.app',
  // A shareable host that redirects to the public path.
  shortHost: 'blog.18hrshift.com',
  // The redirect's destination.
  siteOrigin,
} as const
