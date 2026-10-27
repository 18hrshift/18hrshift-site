'use client'

import { useEffect, useRef } from 'react'
import type { Project } from '@/config/projects'
import { projectCopy } from '@/config/site'
import ProjectArtwork from './ProjectArtwork'
import { ProjectDetails } from './ProjectDetails'

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
    >
      <div className="project-dialog-inner">
        <button className="project-dialog-close" onClick={() => dialogRef.current?.close()} aria-label={projectCopy.closeDetails} autoFocus>
          <span aria-hidden="true">×</span>
        </button>
        <div className="project-dialog-art"><ProjectArtwork project={project} /></div>
        <div className="project-dialog-content">
          <ProjectDetails project={project} titleId="project-dialog-title" />
        </div>
      </div>
    </dialog>
  )
}
