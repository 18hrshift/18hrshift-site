import { home } from '@/config/site'

// The identity tags as a scrolling band. The checkbox pauses it without
// JavaScript; under reduced motion the band is a static, wrapped row.
export function TagTicker() {
  const tags = home.tags
  return (
    <section className="ticker" aria-label={home.tickerLabel}>
      <input type="checkbox" id="ticker-pause" className="ticker-pause-input" />
      <label htmlFor="ticker-pause" className="ticker-pause eyebrow">{home.tickerPause}</label>
      <div className="ticker-window">
        <ul className="ticker-track">
          {tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
        {/* A second copy makes the loop seamless; assistive tech reads the list once. */}
        <ul className="ticker-track ticker-track--echo" aria-hidden="true">
          {tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      </div>
    </section>
  )
}
