import { type ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  title?: string
}

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