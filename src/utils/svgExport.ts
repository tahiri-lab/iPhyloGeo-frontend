function triggerDownload(svgStr: string, filename: string): void {
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSvgElement(svgEl: SVGSVGElement, filename: string, bgColor: string): void {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('width', svgEl.getAttribute('width') ?? '100%')
  bg.setAttribute('height', svgEl.getAttribute('height') ?? '100%')
  bg.setAttribute('fill', bgColor)
  clone.insertBefore(bg, clone.firstChild)
  triggerDownload(new XMLSerializer().serializeToString(clone), filename)
}

export function downloadSvgFromContainer(container: HTMLDivElement | null, filename: string): void {
  const svg = container?.querySelector('svg')
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
