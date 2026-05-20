import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import videoDark from '../../assets/videos/indexPhylogeo.mp4'
import videoLight from '../../assets/videos/indexPhylogeo_light.mp4'

export default function HomePage() {
  const { theme } = useTheme()
  const { t } = useLang()
  const video = theme === 'dark' ? videoDark : videoLight

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Video background — key forces remount on theme change */}
      <video
        key={video}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          filter: theme === 'dark' ? 'brightness(80%)' : 'brightness(80%)',
          transition: 'filter 0.4s ease',
        }}
      >
        <source src={video} type="video/mp4" />
      </video>

      {/* Dark overlay so white text is always legible */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: theme === 'dark' ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.45)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Hero */}
      <div style={{ textAlign: 'center', zIndex: 2, padding: '0 20px' }}>
        <h1
          style={{
            fontWeight: 800,
            fontSize: 'clamp(36px, 6vw, 64px)',
            color: '#fff',
            margin: '0 0 12px',
            letterSpacing: '-1px',
            fontFamily: "'DM Mono', monospace",
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}
        >
          iPhyloGeo
        </h1>

        <div style={{ maxWidth: '640px', margin: '0 auto 32px' }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: 'clamp(15px, 2vw, 19px)',
              color: '#fff',
              lineHeight: 1.6,
              paddingLeft: '20px',
              borderLeft: '3px solid var(--action)',
              margin: 0,
              textAlign: 'left',
              textShadow: '0 1px 8px rgba(0,0,0,0.6)',
            }}
          >
            {t.home_description_before}
            <a
              href="https://github.com/tahiri-lab/iPhyloGeo"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#60c8ff', textDecoration: 'none', fontWeight: 700 }}
            >
              {t.home_phylogeographic}
            </a>
            {t.home_description_after}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/upload"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              borderRadius: '12px',
              backgroundColor: 'var(--action)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'background-color 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--action-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--action)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {t.home_get_started}
          </Link>
          <a
            href="https://github.com/tahiri-lab/iPhyloGeo"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              borderRadius: '12px',
              border: '2px solid rgba(255,255,255,0.6)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'border-color 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#fff'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}