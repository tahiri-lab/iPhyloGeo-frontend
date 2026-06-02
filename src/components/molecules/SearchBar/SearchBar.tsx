import { useEffect, useRef, useState } from 'react'

export interface SearchBarOption {
  id: string
  label: string
  sublabel?: string
  badge?: string
}

interface SearchBarProps {
  options: SearchBarOption[]
  value: string | null
  onSelect: (id: string) => void
  placeholder?: string
}

const searchIcon = (
  <svg width="14" height="14" viewBox="0 0 192.904 192.904" style={{ fill: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true">
    <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z" />
  </svg>
)

const chevronIcon = (open: boolean) => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function SearchBar({ options, value, onSelect, placeholder = 'Select a result…' }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.id === value) ?? null
  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} onKeyDown={handleKey}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          border: `1.5px solid ${open ? 'var(--action)' : 'var(--border)'}`,
          borderRadius: '10px',
          backgroundColor: 'var(--primary)',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          textAlign: 'left',
        }}
      >
        {searchIcon}
        <span style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: selected ? 600 : 400,
          color: selected ? 'var(--text)' : 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.sublabel && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {selected.sublabel}
          </span>
        )}
        {chevronIcon(open)}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'var(--primary)',
            border: '1.5px solid var(--action)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            overflow: 'hidden',
          }}
        >
          {/* Filter input */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter…"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text)',
                backgroundColor: 'var(--secondary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Options list */}
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                No results found
              </div>
            ) : (
              filtered.map(opt => {
                const isSelected = opt.id === value
                return (
                  <div
                    key={opt.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onSelect(opt.id); setOpen(false); setQuery('') }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      paddingLeft: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--action-soft-bg)' : 'transparent',
                      borderLeft: `2px solid ${isSelected ? 'var(--action)' : 'transparent'}`,
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--secondary)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = isSelected ? 'var(--action-soft-bg)' : 'transparent'
                    }}
                  >
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{opt.label}</span>
                      {opt.sublabel && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {opt.badge && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        marginLeft: '10px',
                      }}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
