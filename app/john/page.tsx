import { people } from '@/config/people'
import { profilePages } from '@/config/site'
import { pageMetadata } from '@/lib/metadata'
import { ProfilePage } from '@/components/people/ProfilePage'
import '@/styles/people.css'
import '@/styles/games.css'
import '@/styles/projects.css'
import '@/styles/ideas.css'

const person = people.john
const { metaTitle, description } = profilePages[person.id]

export const metadata = pageMetadata({ title: metaTitle, description, path: person.page, type: 'profile' })

export default function JohnPage() {
  return <ProfilePage person={person} />
}
