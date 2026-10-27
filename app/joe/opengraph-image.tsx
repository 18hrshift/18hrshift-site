import { people } from '@/config/people'
import { ogContentType, ogSize, profileOgAlt, renderProfileOg } from '@/lib/og'

const person = people.joe

export const size = ogSize
export const contentType = ogContentType
export const alt = profileOgAlt(person)

export default function OgImage() {
  return renderProfileOg(person)
}
