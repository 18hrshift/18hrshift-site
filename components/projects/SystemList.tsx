'use client'

import { useState } from 'react'
import { systems, type Project } from '@/config/projects'
import { projectCopy } from '@/config/site'
import ProjectArtwork from './ProjectArtwork'
import ProjectDialog from './ProjectDialog'

// The systems case studies, each opening a native modal with the full story.
// Shared by /lab and John's profile so both read the same config entries.
export function SystemList() {
  const [selected, setSelected] = useState<Project | null>(null)
  return (
    <>
      <ul className="system-list">
        {systems.map((project) => (
          <li key={project.id}>
            <button type="button" className="system-project" onClick={() => setSelected(project)} aria-label={`${projectCopy.explore} ${project.name}`}>
              <span className="system-project-art"><ProjectArtwork project={project} /></span>
              <span className="system-project-copy"><span className="system-project-name">{project.name}</span><span className="system-project-summary">{project.summary}</span></span>
              <span className="system-project-discipline">{project.discipline}</span>
              <span className="system-project-arrow" aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
      {selected && <ProjectDialog project={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
