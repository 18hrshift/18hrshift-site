'use client'

import { useEffect, useRef } from 'react'
import type { Project } from '@/config/projects'
import ProjectArtwork from './ProjectArtwork'

export default function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      dialog?.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClose={(event) => {
        // Strict Mode can reopen the dialog before a cleanup close event arrives.
        if (!event.currentTarget.open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'))
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      data-lenis-prevent
    >
      <div className="project-dialog-inner">
        <button className="project-dialog-close" onClick={() => dialogRef.current?.close()} aria-label="Close project details" autoFocus>
          <span aria-hidden="true">×</span>
        </button>
        <div className="project-dialog-art"><ProjectArtwork id={project.id} /></div>
        <div className="project-dialog-content">
          <p className="eyebrow">{project.discipline}</p>
          <h2 id="project-dialog-title">{project.name}</h2>
          <p className="project-dialog-headline">{project.headline}</p>
          <p className="project-dialog-story">{project.story}</p>
          <h3>What we built</h3>
          <ul className="project-feature-list">
            {project.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
          <div className="project-status-note">
            <span className="project-status">{project.status}</span>
            <p>{project.statusNote}</p>
          </div>
          {project.url && (
            <a className="project-external-link" href={project.url} target="_blank" rel="noopener noreferrer">
              {project.linkLabel} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </dialog>
  )
}
