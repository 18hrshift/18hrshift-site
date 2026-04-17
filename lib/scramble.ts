const CHARS = '!<>-_\\/[]{}—=+*^?#@$%&'

export function scramble(
  el: HTMLElement,
  finalText: string,
  durationMs = 900
): () => void {
  let frame = 0
  const totalFrames = finalText.length * 4
  const frameMs = durationMs / totalFrames

  const id = setInterval(() => {
    el.textContent = finalText
      .split('')
      .map((char, idx) => {
        if (char === ' ') return ' '
        if (idx < frame / 4) return char
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      })
      .join('')

    frame++
    if (frame > totalFrames) {
      clearInterval(id)
      el.textContent = finalText
    }
  }, frameMs)

  return () => clearInterval(id)
}
