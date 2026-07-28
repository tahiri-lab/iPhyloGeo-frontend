import { createContext, useContext, useEffect, useState, useRef } from 'react'
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

// Threshold of consecutive failed ping attempts before marking the server as disconnected
const MAX_FAILURES = 2

/**
 * Context Provider that monitors server connectivity and network latency
 * by periodically pinging the backend API.
 */
export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [serverState, setServerState] = useState<ServerState>('checking')
  const [latency, setLatency] = useState<number | null>(null)
  const [lastPing, setLastPing] = useState<Date | null>(null)

  // Tracks consecutive failures without triggering component re-renders
  const failureCountRef = useRef(0)

  useEffect(() => {
    let isMounted = true

    const ping = async () => {
      // Immediate fallback if the browser itself has no network connection
      if (!navigator.onLine) {
        if (isMounted) {
          setServerState('disconnected')
          setLatency(null)
          setLastPing(new Date())
        }
        return
      }

      const t0 = Date.now()
      try {
        // Execute API check; throws an exception on HTTP errors or network failure
        await api.results.list()

        if (isMounted) {
          failureCountRef.current = 0 // Reset failure counter on successful request
          setLatency(Date.now() - t0)
          setServerState('connected')
        }
      } catch {
        if (isMounted) {
          failureCountRef.current += 1

          // Only switch state to disconnected after reaching MAX_FAILURES
          if (failureCountRef.current >= MAX_FAILURES) {
            setServerState('disconnected')
            setLatency(null)
          }
        }
      } finally {
        if (isMounted) {
          setLastPing(new Date())
        }
      }
    }

    // Initial check on mount
    ping()

    // Poll the server every 5 seconds
    const id = setInterval(ping, 5000)

    // Event listeners for browser network connectivity status
    const handleOnline = () => ping()
    const handleOffline = () => {
      failureCountRef.current = MAX_FAILURES
      setServerState('disconnected')
      setLatency(null)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Clean up timers and event listeners on unmount
    return () => {
      isMounted = false
      clearInterval(id)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
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