import type { Project } from '@/config/projects'
import { projectCopy } from '@/config/site'
import { ExternalLink } from '@/components/ui/primitives'

// The full story of a project: used inside the system dialogs and inline on the profile pages.
export function ProjectDetails({ project, titleId, headingLevel = 2 }: { project: Project; titleId: string; headingLevel?: 2 | 3 }) {
  const Title = headingLevel === 2 ? 'h2' : 'h3'
  const Sub = headingLevel === 2 ? 'h3' : 'h4'
  return (
    <div className="project-details">
      <p className="eyebrow">{project.discipline}</p>
      <Title id={titleId} className="project-details-title">{project.name}</Title>
      {project.headline && <p className="project-details-headline">{project.headline}</p>}
      <p className="project-details-story">{project.story}</p>
      {project.features && (
        <>
          <Sub className="project-details-subhead">{projectCopy.featuresHeading}</Sub>
          <ul className="project-feature-list">
            {project.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        </>
      )}
      {project.status && (
        <div className="project-status-note">
          <span className="project-status">{project.status}</span>
          {project.statusNote && <p>{project.statusNote}</p>}
        </div>
      )}
      {project.url && (
        <ExternalLink className="project-external-link" href={project.url}>
          {project.linkLabel} <span aria-hidden="true">↗</span>
        </ExternalLink>
      )}
    </div>
  )
}
