'use client'

import { useState } from 'react'
import { projects, type Project, type ProjectCategory } from '@/config/projects'
import ProjectArtwork from '@/components/portfolio/ProjectArtwork'
import ProjectDialog from '@/components/portfolio/ProjectDialog'
import '@/styles/portfolio.css'

const filters = ['All', 'Products', 'Games', 'Systems'] as const

export function Portfolio() {
  const [filter, setFilter] = useState<'All' | ProjectCategory>('All')
  const [selected, setSelected] = useState<Project | null>(null)
  const visibleProjects = projects.filter((project) => filter === 'All' || project.categories.includes(filter))
  const featuredProjects = visibleProjects.filter((project) => project.layout !== 'system')
  const systemProjects = visibleProjects.filter((project) => project.layout === 'system')

  return (
    <section id="work" className="portfolio section-shell" aria-labelledby="portfolio-title">
      <div className="portfolio-heading">
        <div>
          <p className="eyebrow">01 / Selected work</p>
          <h2 id="portfolio-title">OUT OF OUR HEADS.<br /><span>INTO YOUR HANDS.</span></h2>
        </div>
        <div className="portfolio-heading-aside">
          <p>Worlds to get lost in. Tools to get things done.<br />A few things we couldn’t leave as ideas.</p>
          <div className="portfolio-filters" role="group" aria-label="Filter projects">
            {filters.map((item) => (
              <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Showing {visibleProjects.length} projects</p>
      {featuredProjects.length > 0 && <div className="portfolio-grid">
        {featuredProjects.map((project) => (
          <article key={project.id} className="portfolio-project">
            <button className="project-card" onClick={() => setSelected(project)} aria-label={`Explore ${project.name}`}>
              <div className="project-art-frame">
                <ProjectArtwork id={project.id} />
                <span className="project-open-icon" aria-hidden="true">↗</span>
              </div>
              <span className="project-card-info">
                <span className="project-card-name"><span className="project-number">{project.number}</span><span>{project.name}</span></span>
                <span className="project-card-discipline">{project.discipline}</span>
              </span>
              <span className="project-card-bottom"><span>{project.summary}</span><span className="project-card-status">{project.status}</span></span>
            </button>
          </article>
        ))}
      </div>}
      {systemProjects.length > 0 && (
        <div className="portfolio-systems">
          <div className="portfolio-systems-heading"><p className="eyebrow">Under the surface</p><p>We build the systems behind the experience, too.</p></div>
          <div className="portfolio-system-list">
            {systemProjects.map((project) => (
              <article key={project.id}>
                <button className="system-project" onClick={() => setSelected(project)} aria-label={`Explore ${project.name}`}>
                  <span className="system-project-art"><ProjectArtwork id={project.id} /></span>
                  <span className="system-project-copy"><span className="system-project-name">{project.name}</span><span className="system-project-summary">{project.summary}</span></span>
                  <span className="system-project-discipline">{project.discipline}</span>
                  <span className="system-project-arrow" aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
      {selected && <ProjectDialog project={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
