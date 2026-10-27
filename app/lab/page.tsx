import { labPage } from '@/config/site'
import { pageMetadata } from '@/lib/metadata'
import { Lab } from '@/components/lab/Lab'
import { SystemList } from '@/components/projects/SystemList'
import '@/styles/lab.css'
import '@/styles/projects.css'

export const metadata = pageMetadata({ title: labPage.metaTitle, description: labPage.description, path: labPage.path })

export default function LabPage() {
  const { systems } = labPage
  return (
    <>
      <Lab />
      <section id="systems" className="systems section-shell" aria-labelledby="systems-title">
        <div className="systems-heading">
          <div>
            <p className="eyebrow section-eyebrow">{systems.eyebrow}</p>
            <h2 id="systems-title" className="section-title">{systems.title}</h2>
          </div>
          <p className="section-aside">{systems.aside}</p>
        </div>
        <SystemList />
      </section>
    </>
  )
}
