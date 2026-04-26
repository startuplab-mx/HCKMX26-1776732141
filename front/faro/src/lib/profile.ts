/**
 * Anonymous, cookie-backed profile id for the public report flow.
 *
 * The cookie just links a browser to its own report submissions so the landing
 * page can show a level/badge progression. No PII is stored.
 *
 * The default value matches the seeded demo profile so the demo UI shows
 * "16 reportes validados" out of the box.
 */
const COOKIE_NAME = 'faro_profile'
const DEMO_PROFILE_ID = 'demo-profile'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function readCookie(name: string): string | null {
    const match = document.cookie.split('; ').find((row) => row.startsWith(name + '='))
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
    const v = encodeURIComponent(value)
    document.cookie = `${name}=${v}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`
}

export function getOrCreateProfileId(): string {
    const existing = readCookie(COOKIE_NAME)
    if (existing) return existing
    writeCookie(COOKIE_NAME, DEMO_PROFILE_ID, ONE_YEAR_SECONDS)
    return DEMO_PROFILE_ID
}

export function resetProfileId(): string {
    const next =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `p-${Math.random().toString(36).slice(2)}-${Date.now()}`
    writeCookie(COOKIE_NAME, next, ONE_YEAR_SECONDS)
    return next
}
