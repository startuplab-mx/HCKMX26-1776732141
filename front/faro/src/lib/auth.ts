const KEY = 'faro_session'

export type Session = { token: string; username: string; role: string }

export function saveSession(s: Session) {
    localStorage.setItem(KEY, JSON.stringify(s))
}

export function getSession(): Session | null {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as Session
    } catch {
        return null
    }
}

export function clearSession() {
    localStorage.removeItem(KEY)
}
