import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface Tree {
  name: string
  newick: string
}

interface TreePaginationProps {
  trees: Tree[]
  renderTree: (name: string, newick: string) => React.ReactNode
  pageSize?: number
  minItemWidth?: number
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export default function TreePagination({ trees, renderTree, pageSize = 6, minItemWidth = 420 }: TreePaginationProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(trees.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const visible = trees.slice(start, start + pageSize)
  const pageNums = getPageNumbers(safePage, totalPages)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`, gap: '24px', marginBottom: totalPages > 1 ? '24px' : 0 }}>
        {visible.map(tree => renderTree(tree.name, tree.newick))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6" style={{ marginTop: '8px' }}>
          <p className="text-sm text-gray-300">
            Showing <span className="font-medium">{start + 1}</span>–<span className="font-medium">{Math.min(start + pageSize, trees.length)}</span> of{' '}
            <span className="font-medium">{trees.length}</span>
          </p>
          <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md">
            <button
              disabled={safePage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>
            {pageNums.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 inset-ring inset-ring-gray-700">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  aria-current={p === safePage ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                    p === safePage
                      ? 'z-10 bg-indigo-500 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
                      : 'text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:outline-offset-0'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}
