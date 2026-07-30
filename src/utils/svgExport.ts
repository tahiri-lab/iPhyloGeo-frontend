function triggerDownload(svgStr: string, filename: string): void {
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Downloads a clone of `svgEl` as a standalone `.svg` file. A solid-color
 * `<rect>` is inserted behind the content because the live SVG usually
 * has a transparent/CSS background — without it, an exported dark-theme
 * tree would open as illegible dark lines on a transparent (effectively
 * white) background.
 */
export function downloadSvgElement(svgEl: SVGSVGElement, filename: string, bgColor: string): void {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('width', svgEl.getAttribute('width') ?? '100%')
  bg.setAttribute('height', svgEl.getAttribute('height') ?? '100%')
  bg.setAttribute('fill', bgColor)
  clone.insertBefore(bg, clone.firstChild)
  triggerDownload(new XMLSerializer().serializeToString(clone), filename)
}

/**
 * Same as {@link downloadSvgElement}, but for a Recharts-rendered chart:
 * finds the `<svg>` inside `container` (Recharts wraps it in
 * `.recharts-wrapper`) and, critically, resolves every `var(--...)` in the
 * serialized markup to its current computed value. This is required because
 * an exported `.svg` file is opened outside the page — it has no access to
 * this site's CSS custom properties, so unresolved `var()` refs would just
 * render as black/default rather than the app's actual theme colors.
 */
export function downloadSvgFromContainer(container: HTMLDivElement | null, filename: string): void {
  const svg = container?.querySelector<SVGSVGElement>('.recharts-wrapper > svg') ?? container?.querySelector('svg')
  if (!svg) return
  const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const clone = svg.cloneNode(true) as SVGSVGElement
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('width', '100%')
  bg.setAttribute('height', '100%')
  bg.setAttribute('fill', cssVar('--primary') || '#ffffff')
  clone.insertBefore(bg, clone.firstChild)
  const svgStr = new XMLSerializer().serializeToString(clone)
    .replace(/var\(--([\w-]+)\)/g, (_, n) => cssVar(`--${n}`) || 'currentColor')
  triggerDownload(svgStr, filename)
}
