import { site } from '@/config/site'

export function Footer() {
  return (
    <footer className="py-8 px-6 md:px-16 border-t border-surface2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted tracking-widest">
          {site.monogram} © {new Date().getFullYear()}
        </span>
        <span className="font-mono text-[10px] text-muted tracking-[0.3em]">
          ALL SYSTEMS NOMINAL
        </span>
      </div>
    </footer>
  )
}
