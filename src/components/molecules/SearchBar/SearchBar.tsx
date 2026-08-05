import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'
import { useLang } from '../../../context/LanguageContext'

export interface SearchBarOptionHover {
  text: string
  content: ReactNode
}

export interface SearchBarOption {
  id: string
  label: string
  hover?: SearchBarOptionHover
  sublabel?: string
  badge?: string
}

interface SearchBarProps {
  options: SearchBarOption[]
  value: string | null
  onSelect: (id: string) => void
  placeholder?: string
  trigger?: number
  triggerSend?: () => void
}

type SearchMode = 'name' | 'status' | 'date'
const searchModes: SearchMode[] = ['name', 'status', 'date']

const searchIcon = (
  <svg width="14" height="14" viewBox="0 0 192.904 192.904" style={{ fill: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true">
    <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z" />
  </svg>
)

const shortcuts = Array.from({ length: 10 }, (_, i) => String(i))
  .concat(Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)))
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

/**
 * Custom combobox for selecting a result: a filterable dropdown that can
 * search by name (substring), exact status match, or a `YYYY-MM-DD` date
 * substring against `sublabel`, selected via the mode `<select>` in the
 * dropdown header. `option.hover` (used for the settings-preview badge on
 * Results/Compare) renders as a Radix `HoverCard` — pass `null` explicitly
 * for its unused fields if reusing `SettingsView` there, since it has no
 * default props.
 */
export default function SearchBar({ options, value, onSelect, placeholder = 'Select a result…', triggerSend, trigger }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>('name')
  const [query, setQuery] = useState('')
  const { t } = useLang()

  const [isAltHeld, setIsAltHeld] = useState(false)
  const [isControlHeld, setIsControlHeld] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null)
  const selectedRef = useRef<HTMLElement>(null)

  const selected = options.find(o => o.id === value) ?? null
  const filtered = useMemo(() => {
    return options.filter(o => {
      // Filter options based on the selected search mode
      if (!query.trim()) return true

      if (searchMode === 'name') {
        return o.label.toLowerCase().includes(query.toLowerCase())
      }

      if (searchMode === 'status') {
        return o.badge?.toLowerCase() === query.toLowerCase()
      }

      if (searchMode === 'date') {
        // Basic check to see if the sublabel or date contains the input value (YYYY-MM-DD)
        return o.sublabel ? o.sublabel.includes(query) : false
      }

      return true
    })
  }, [query])

  // The array reference always changes when filtered is recomputed so we need a stable way to compare
  const filteredIds = filtered.map(x => x.id).join(",")
  useEffect(() => {
    setHighlighted(selected ? filtered.findIndex(o => o.id === selected.id) : -1)
  }, [filteredIds, selected])

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
    if (!open) return
    switch (searchMode) {
      case 'name':
        setTimeout(() => inputRef.current?.focus(), 0)
        break;
      case 'date':
        setTimeout(() => dateRef.current?.focus(), 0)
        break;
      case 'status':
        setTimeout(() => statusRef.current?.focus(), 0)
        break;
    }
  }, [open, searchMode])

  useEffect(() => {
    if (trigger !== undefined && trigger !== 0) setOpen(true)
  }, [trigger])

  // Hijack all alphanumeric keypresses on the page to open the search bar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (open) return

      if (e.key == 'Escape') {
        setOpen(true)
      }

      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setSearchMode('name')
        setQuery(e.key)
        setOpen(true)
        e.preventDefault()
      }
    }

    if (trigger === undefined) {
      window.addEventListener("keydown", handler)
      return () => {
        window.removeEventListener("keydown", handler)
      }
    }
  }, [open])

  useEffect(() => {
    const show = isAltHeld && isControlHeld;
    setShowShortcuts(show)
  }, [isControlHeld, isAltHeld])

  function handleKeyUp(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Alt':
        setIsAltHeld(false)
        break;
      case 'Control':
        setIsControlHeld(false)
        break;
    }
  }

  function reset() {
    setQuery('')
    setOpen(false)
    setShowShortcuts(false)
    setIsControlHeld(false)
    setIsAltHeld(false)
    setSearchMode('name')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isAltHeld && isControlHeld && /^[a-z0-9]$/.test(e.key)) {
      const jumpTo = filtered.at(shortcuts.indexOf(e.key))
      if (jumpTo) {
        onSelect(jumpTo.id)
        reset()
        e.preventDefault()
        e.stopPropagation()
        if (triggerSend !== undefined) triggerSend()
      }
    }

    const status = statusRef.current!;
    const el = selectedRef.current
    const parent = el?.parentElement
    switch (e.key) {
      case 'Alt':
        setIsAltHeld(true)
        break;
      case 'Control':
        setIsControlHeld(true)
        break;
      case 'Escape':
        setOpen(false)
        e.stopPropagation()
        break;
      case 'ArrowUp':
        if (highlighted == -1) {
          setHighlighted(filtered.length - 1)
          return;
        }
        setHighlighted(h => (h - 1 + filtered.length) % filtered.length)
        e.preventDefault()

        if (el && parent) {
          const elRect = el.getBoundingClientRect()
          const parentRect = parent.getBoundingClientRect()

          parent.scrollTop +=
            elRect.top -
            parentRect.top -
            (parentRect.height / 2) +
            (elRect.height / 2)
        }
        break;
      case 'ArrowDown':
        setHighlighted(h => (h + 1 + filtered.length) % filtered.length)
        e.preventDefault()

        if (el && parent) {
          const elRect = el.getBoundingClientRect()
          const parentRect = parent.getBoundingClientRect()

          parent.scrollTop +=
            elRect.top -
            parentRect.top -
            (parentRect.height / 2) +
            (elRect.height / 2)
        }
        break;
      case 'ArrowLeft':
        if (searchMode == 'status') {
          status.selectedIndex = (status.selectedIndex - 1 + status.options.length)
            % status.options.length
          status.dispatchEvent(new Event("change", { bubbles: true }));
          e.preventDefault()
        }
        break;
      case 'ArrowRight':
        if (searchMode == 'status') {
          status.selectedIndex = (status.selectedIndex + 1) % status.options.length,
          status.dispatchEvent(new Event("change", { bubbles: true }));
          e.preventDefault()
        }
        break;
      case 'Tab':
        const currModeIdx = searchModes.indexOf(searchMode)
        setQuery('')
        setSearchMode(searchModes[(currModeIdx + 1) % searchModes.length])
        break;
      case 'Enter':
        if (highlighted >= 0) {
          onSelect(filtered[highlighted].id)
          reset()
          if (triggerSend !== undefined) triggerSend()
        }
        break;
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(v => !v)
        }}
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
          fontSize: '14px',
          fontWeight: selected ? 600 : 400,
          color: selected ? 'var(--text)' : 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }} >
          {selected?.hover && <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '1px 6px',
            borderRadius: '20px',
            backgroundColor: 'var(--action)',
            color: 'var(--primary)',
            border: '1px solid var(--border)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            marginLeft: '2px',
          }}
          >
            {selected.hover.text}
          </span>}
        </div>
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
          {/* Filter control area */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px' }}>

            {/* Search mode selector */}
            <select
              value={searchMode}
              onChange={e => {
                setSearchMode(e.target.value as SearchMode)
                setQuery('') // Reset query on mode change
              }}
              style={{
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text)',
                backgroundColor: 'var(--secondary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="name">{t.results_searchFilterModeName}</option>
              <option value="status">{t.results_searchFilterModeStatus}</option>
              <option value="date">{t.results_searchFilterModeDate}</option>
            </select>

            {/* Conditional input based on search mode */}
            <div style={{ flex: 1 }}>
              {searchMode === 'name' && (
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                  }}
                  placeholder={t.results_searchFilterByNamePlaceholder}
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
              )}

              {searchMode === 'status' && (
                <select
                  value={query}
                  ref={statusRef}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text)',
                    backgroundColor: 'var(--secondary)',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">{t.results_searchFilterByStatusAll}</option>
                  <option value="complete">{t.results_searchFilterByStatusComplete}</option>
                  <option value="pending">{t.results_searchFilterByStatusPending}</option>
                  <option value="failed">{t.results_searchFilterByStatusFailed}</option>
                </select>
              )}

              {searchMode === 'date' && (
                <input
                  type="date"
                  value={query}
                  ref={dateRef}
                  onChange={e => setQuery(e.target.value)}
                  onClick={e => {
                    // Open native date picker when clicking anywhere in the input
                    try {
                      e.currentTarget.showPicker()
                    } catch {
                      // Fallback for older browsers
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text)',
                    backgroundColor: 'var(--secondary)',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                No results found
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = i == highlighted
                return (
                  <div
                    key={opt.id}
                    role="option"
                    aria-selected={isSelected}
                    ref={isSelected ? selectedRef : undefined}
                    onClick={() => {
                      onSelect(opt.id)
                      reset()
                    }}
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
                    <div style={{
                      display: 'flex',
                      gap: 20,
                      alignItems: 'center',
                    }}>
                    {showShortcuts && <div style={{
                      fontSize: '14px',
                      textAlign: 'center',
                      backgroundColor: 'var(--secondary)',
                      borderRadius: '100%',
                      border: '1px solid var(--action)',
                      width: '24px'
                    }}>
                      {shortcuts[i]}
                    </div>}
                      <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{opt.label}</span>
                        {opt.hover && (
                          <HoverCard.Root>
                            <HoverCard.Trigger asChild>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '20px',
                                backgroundColor: 'var(--action)',
                                color: 'var(--primary)',
                                border: '1px solid var(--border)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                marginLeft: '10px',
                              }}
                              >
                                {opt.hover.text}
                              </span>
                            </HoverCard.Trigger>
                            <HoverCard.Portal>
                              <HoverCard.Content
                                side="right"
                                sideOffset={5}
                                style={{
                                  background: 'var(--primary)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                  zIndex: 1000,

                                  maxWidth: 'min(400px, calc(100vw - 40px))',
                                  maxHeight: 'calc(80vh)',
                                  overflowY: 'auto',
                                  overflowX: 'auto',
                                }}
                              >
                                {opt.hover.content}
                              </HoverCard.Content>
                            </HoverCard.Portal>
                          </HoverCard.Root>
                        )}
                        {opt.sublabel && (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
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
                      }}
                      >
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
