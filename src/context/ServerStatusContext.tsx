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

// Nombre d'échecs consécutifs requis avant de déclarer le serveur déconnecté
const MAX_FAILURES = 2

export function ServerStatusProvider({ children }: { children: ReactNode }) {
    const [serverState, setServerState] = useState<ServerState>('checking')
    const [latency, setLatency] = useState<number | null>(null)
    const [lastPing, setLastPing] = useState<Date | null>(null)

    // Compteur d'échecs consécutifs maintenu sans réafficher le composant
    const failureCountRef = useRef(0)

    useEffect(() => {
        let isMounted = true

        const ping = async () => {
            // Si le navigateur lui-même n'a pas d'accès Internet
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
                // Exécute la requête : si le serveur renvoie 4xx/5xx, une erreur est levée ici
                await api.results.list()

                if (isMounted) {
                    failureCountRef.current = 0 // Réinitialisation des échecs en cas de succès
                    setLatency(Date.now() - t0)
                    setServerState('connected')
                }
            } catch {
                if (isMounted) {
                    failureCountRef.current += 1

                    // Ne bascule en "disconnected" qu'après MAX_FAILURES échecs consécutifs
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

        ping()
        const id = setInterval(ping, 5000)

        // Écouteurs d'événements pour l'état réseau natif du navigateur
        const handleOnline = () => ping()
        const handleOffline = () => {
            failureCountRef.current = MAX_FAILURES
            setServerState('disconnected')
            setLatency(null)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

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