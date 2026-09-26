import Image from 'next/image'
import SystemArtwork from './SystemArtwork'

export default function ProjectArtwork({ id }: { id: string }) {
  if (['bedrock', 'openwrt', 'homelab'].includes(id)) return <SystemArtwork id={id} />

  if (id === 'embersave') {
    return (
      <div className="project-art project-art--embersave" aria-hidden="true">
        <div className="ember-orbit ember-orbit--one" />
        <div className="ember-orbit ember-orbit--two" />
        <div className="ember-orbit ember-orbit--three" />
        <div className="ember-spark ember-spark--one" />
        <div className="ember-spark ember-spark--two" />
        <span className="project-art-corner">KEEP THE WORLD ALIVE</span>
        <Image className="ember-mark" src="/projects/embersave-mark.svg" alt="" width={310} height={310} />
        <Image className="ember-lockup" src="/projects/embersave-lockup.svg" alt="" width={440} height={104} />
        <span className="project-art-footnote">YOUR WORLD. YOUR FRIENDS. YOUR TURN.</span>
      </div>
    )
  }

  if (id === 'specter') {
    return (
      <div className="project-art project-art--specter" aria-hidden="true">
        <Image className="specter-capture" src="/projects/specter-gameplay.png" alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
        <div className="specter-tint" />
        <span className="project-art-corner">18HRSHIFT GAMES / EXPERIMENT 01</span>
        <div className="specter-title">SPECTER<span>1—1</span></div>
        <span className="project-art-footnote">ACTUAL BROWSER GAMEPLAY</span>
        <span className="specter-crosshair" />
      </div>
    )
  }

  if (id === 'hairraiser') {
    return (
      <div className="project-art project-art--hairraiser" aria-hidden="true">
        <span className="project-art-corner">A LITTLE SUPPORT GOES A LONG WAY.</span>
        <div className="hairraiser-orbit" />
        <div className="hairraiser-photo">
          <Image src="/projects/hairraiser-portrait.jpg" alt="" fill sizes="(max-width: 700px) 48vw, 24vw" />
        </div>
        <Image className="hairraiser-wordmark" src="/projects/hairraiser-wordmark.svg" alt="" width={450} height={151} />
        <span className="hairraiser-star">✦</span>
        <span className="project-art-footnote">FUND YOUR COMEBACK.</span>
      </div>
    )
  }

  return (
    <div className="project-art project-art--openwater" aria-hidden="true">
      <svg className="openwater-contours" viewBox="0 0 700 460" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d="M-50 365C53 424 162 416 205 333S228 175 320 184s154 81 248 5S732 68 750 15" />
        <path d="M-50 344C53 403 137 402 184 317S223 143 322 160s157 77 241 8S733 43 750-8" />
        <path d="M-50 320C53 379 120 376 165 295S214 115 328 135s153 72 230 14S734 18 750-31" />
        <path d="M-50 296C53 355 100 352 145 272S203 89 334 108s148 70 221 15S731-7 750-54" />
        <path d="M-50 272C53 331 76 327 123 250S189 64 340 82s143 66 212 15S732-33 750-79" />
        <path d="M-50 248C53 307 57 303 101 228S170 41 345 56s139 63 204 15S732-58 750-104" />
        <path d="M-50 386C53 445 186 443 228 351S236 209 320 210s153 85 251 5S732 91 750 39" />
        <path d="M-50 410C53 469 210 467 252 373S248 237 320 236s153 85 255 5S732 117 750 63" />
        <path d="M-50 435C53 494 234 491 276 395S260 265 322 263s153 86 257 3S732 143 750 89" />
        <path d="M-50 459C53 518 258 515 300 417S272 293 324 290s153 84 259 1S732 169 750 115" />
      </svg>
      <span className="project-art-corner">OUT THERE IS THE POINT.</span>
      <span className="openwater-pin"><span /></span>
      <div className="openwater-wordmark">openwater<span>GOOD DAYS START HERE.</span></div>
      <span className="openwater-ripple openwater-ripple--one" />
      <span className="openwater-ripple openwater-ripple--two" />
      <span className="project-art-footnote">LOCAL FIRST. OUTDOORS ALWAYS.</span>
    </div>
  )
}
