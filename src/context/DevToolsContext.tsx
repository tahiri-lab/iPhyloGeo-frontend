import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface DevError {
  id: number
  message: string
  at: Date
}

interface DevToolsContextType {
  errors: DevError[]
  reportError: (msg: string) => void
  clearErrors: () => void
}

const DevToolsContext = createContext<DevToolsContextType>({
  errors: [],
  reportError: () => {},
  clearErrors: () => {},
})

let _id = 0

export function DevToolsProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<DevError[]>([])

  const reportError = useCallback((message: string) => {
    setErrors(prev => [...prev.slice(-29), { id: _id++, message, at: new Date() }])
  }, [])

  const clearErrors = useCallback(() => setErrors([]), [])

  return (
    <DevToolsContext.Provider value={{ errors, reportError, clearErrors }}>
      {children}
    </DevToolsContext.Provider>
  )
}

export const useDevTools = () => useContext(DevToolsContext)
