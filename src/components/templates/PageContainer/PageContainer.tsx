import { type ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  title?: string
}

/** Centered, viewport-width-padded wrapper with an optional page `<h1>`. Every route except `/` renders its content inside this. */
export default function PageContainer({ children, title }: PageContainerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '0 5vw',
      }}
    >
      {title && (
        <h1
          style={{
            color: 'var(--text)',
            paddingTop: '30px',
            fontSize: '40px',
            fontWeight: 'bold',
            marginBottom: '20px',
            width: '100%',
          }}
        >
          {title}
        </h1>
      )}
      {children}
    </div>
  )
}