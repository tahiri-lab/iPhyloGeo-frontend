import { useLang } from '../../../context/LanguageContext'

interface DownloadButtonProps {
  onClick: () => void
}

export default function DownloadButton({onClick}: DownloadButtonProps) {
  const { t } = useLang()
  return (<button
    onClick={onClick}
    title={t.tree_download}
    style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 7,
      border: '1px solid var(--border)',
      background: 'transparent', color: 'var(--text-secondary)',
      fontSize: 11, cursor: 'pointer',
    }}
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    {t.tree_download}
  </button>)
}
