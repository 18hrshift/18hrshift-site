import { labModes } from '@/config/lab'
import { labPage } from '@/config/site'
import { ogContentType, ogSize, renderOg } from '@/lib/og'

export const size = ogSize
export const contentType = ogContentType
export const alt = `The 18HRSHIFT lab. ${labPage.title.join(' ')}`

export default function OgImage() {
  return renderOg({ eyebrow: labPage.eyebrow, title: labPage.title, footer: labModes.map((mode) => mode.name).join(' / ') })
}
