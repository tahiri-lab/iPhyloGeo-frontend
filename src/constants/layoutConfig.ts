import type cytoscape from 'cytoscape'

export type LayoutType = 'top-down' | 'left-right' | 'force' | 'force-loose'

export const LAYOUTS: { value: LayoutType; label: string }[] = [
  { value: 'top-down',    label: 'top-down' },
  { value: 'left-right',  label: 'left-right' },
  { value: 'force',       label: 'force' },
  { value: 'force-loose', label: 'force-loose' },
]

export function getLayoutConfig(layout: LayoutType): cytoscape.LayoutOptions {
  switch (layout) {
    case 'top-down':
    case 'left-right':
      return { name: 'preset', padding: 40, fit: true } as cytoscape.LayoutOptions
    case 'force':
      return {
        name: 'cose', animate: false, numIter: 1000,
        nodeRepulsion: 4500, idealEdgeLength: 50, fit: true, padding: 30,
      } as unknown as cytoscape.LayoutOptions
    case 'force-loose':
      return {
        name: 'cose', animate: false, numIter: 2000,
        nodeRepulsion: 9000, idealEdgeLength: 100, fit: true, padding: 30,
      } as unknown as cytoscape.LayoutOptions
  }
}
