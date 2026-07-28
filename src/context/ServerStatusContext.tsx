import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'

type ServerState = 'checking' | 'connected' | 'disconnected'

interface ServerStatusContextType {
  serverState: ServerState
  isOffline: boolean
  latency: number | null
  lastPing: Date | null
}

const ServerStatusContext = createContext<ServerStatusContextType | null>(null)

export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [serverState, setServerState] = useState<ServerState>('checking')
  const [latency, setLatency] = useState<number | null>(null)
  const [lastPing, setLastPing] = useState<Date | null>(null)

  useEffect(() => {
    const ping = async () => {
      const t0 = Date.now()
      try {
        await api.results.list()
        setLatency(Date.now() - t0)
        setServerState('connected')
      } catch {
        setServerState('disconnected')
        setLatency(null)
      }
      setLastPing(new Date())
    }

    ping()
    const id = setInterval(ping, 5000)
    return () => clearInterval(id)
  }, [])

  const isOffline = serverState === 'disconnected'

  return (
    <ServerStatusContext.Provider value={{ serverState, isOffline, latency, lastPing }}>
      {children}
    </ServerStatusContext.Provider>
  )
}

/**
 * Custom hook to access server status.
 * If the Provider is missing, it returns a safe default value to prevent crashes.
 */
export function useServerStatus() {
  const ctx = useContext(ServerStatusContext)

  if (!ctx) {
    return {
      serverState: 'connected' as ServerState,
      isOffline: false,
      latency: null,
      lastPing: null,
    }
  }

  return ctx
}