export default function SystemArtwork({ id }: { id: string }) {
  return (
    <div className={`system-art system-art--${id}`} aria-hidden="true">
      <div className="system-art-grid" />
      <svg viewBox="0 0 120 120" fill="none" className="system-art-icon">
        {id === 'bedrock' && <>
          <ellipse cx="60" cy="29" rx="31" ry="13" />
          <path d="M29 29v62c0 7 14 13 31 13s31-6 31-13V29M29 50c0 7 14 13 31 13s31-6 31-13M29 71c0 7 14 13 31 13s31-6 31-13" />
          <path className="system-art-detail" d="M46 39v57m28-57v57" />
        </>}
        {id === 'openwrt' && <>
          <rect x="23" y="68" width="74" height="24" rx="4" />
          <path d="M33 68V45m54 23V45M39 32c12-11 30-11 42 0M48 43c7-6 17-6 24 0M56 54h8" />
          <path className="system-art-detail" d="M33 80h4m7 0h4m7 0h4m17 0h11M42 92v7m36-7v7" />
        </>}
        {id === 'homelab' && <>
          <rect x="26" y="18" width="68" height="25" rx="4" />
          <rect x="26" y="48" width="68" height="25" rx="4" />
          <rect x="26" y="78" width="68" height="25" rx="4" />
          <path className="system-art-detail" d="M37 30h21m-21 30h21m-21 30h21M75 30h7m-7 30h7m-7 30h7" />
        </>}
      </svg>
      <span className="system-art-word">{id === 'bedrock' ? 'STORE.' : id === 'openwrt' ? 'CONNECT.' : 'RUN.'}</span>
    </div>
  )
}
