import type { Project } from '@/config/projects'
import ProjectArtwork from './ProjectArtwork'
import { ProjectDetails } from './ProjectDetails'

// A project laid out inline: artwork beside its full story.
export function ProjectFeature({ project }: { project: Project }) {
  return (
    <article className="project-feature" aria-labelledby={`${project.id}-title`}>
      <div className="project-feature-art"><ProjectArtwork project={project} /></div>
      <ProjectDetails project={project} titleId={`${project.id}-title`} headingLevel={3} />
    </article>
  )
}
