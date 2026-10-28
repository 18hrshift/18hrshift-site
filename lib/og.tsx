import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { Person } from '@/config/people'
import { profileCopy, site } from '@/config/site'
import { lettermarkPaths, lettermarkViewBox } from '@/components/brand/Lettermark'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

// ImageResponse renders outside the page and can't read its CSS variables, so the
// token values from app/globals.css are repeated here for the share images only.
const palette = { background: '#0b0d0c', ink: '#f1f2e9', accent: '#d7ff3f', muted: '#939b90', magenta: '#fa84bc', rule: '#30362f' }

type OgInput = {
  eyebrow: string
  title: readonly string[]
  footer: string
  // A file under public/ shown on the right, or the lettermark when omitted.
  image?: string
}

async function dataUrl(publicPath: string) {
  const file = await readFile(join(process.cwd(), 'public', publicPath))
  const type = publicPath.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return `data:${type};base64,${file.toString('base64')}`
}

export async function renderOg({ eyebrow, title, footer, image }: OgInput) {
  const picture = image ? await dataUrl(image) : null
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: palette.background, color: palette.ink, padding: '56px 68px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, fontWeight: 700 }}>
        <span>{site.name}</span>
        <span style={{ color: palette.muted, fontSize: 18, letterSpacing: 2 }}>{eyebrow.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 100, lineHeight: 1, fontWeight: 900, letterSpacing: '-5px' }}>
          {title.map((line, index) => <span key={line} style={{ color: index > 0 ? palette.accent : palette.ink }}>{line.toUpperCase()}</span>)}
        </div>
        {picture
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={picture} width={300} height={300} alt="" style={{ borderRadius: 24, border: `2px solid ${palette.rule}` }} />
          : (
            <svg width={330} height={151} viewBox={lettermarkViewBox} fill={palette.accent}>
              {lettermarkPaths.map((d) => <path key={d} d={d} />)}
            </svg>
          )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: palette.muted, borderTop: `1px solid ${palette.rule}`, paddingTop: 22 }}>
        <span>{footer}</span>
        <span>{new URL(site.url).host} ↗</span>
      </div>
    </div>,
    ogSize,
  )
}

// Share image for a player profile: name, initials and their skull avatar.
export function renderProfileOg(person: Person) {
  const [first, ...rest] = person.name.split(' ')
  return renderOg({ eyebrow: `${person.initials} / ${profileCopy.eyebrow}`, title: [first, rest.join(' ')], footer: person.line, image: person.avatar.src })
}

export const profileOgAlt = (person: Person) => `${person.name}, co-founder of ${site.name}, with a skull avatar.`
