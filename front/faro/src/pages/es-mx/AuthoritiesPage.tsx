import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/landing.css'
import '../../styles/report-flow.css'
import '../../styles/authorities.css'

type Authority = {
    id: number
    name: string
    email: string
    enabled: boolean
}

export function AuthoritiesPage() {
    const navigate = useNavigate()
    const [authorities, setAuthorities] = useState<Authority[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        fetch('/api/authorities?enabled=true')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json()
            })
            .then((data: Authority[]) => {
                if (!cancelled) setAuthorities(data)
            })
            .catch((e: Error) => {
                if (!cancelled) setError(e.message)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="landing">
            <nav className="navbar">
                <div className="nav-logo">
                    <div className="nav-logo-mark">
                        <span className="logo-ch">Ch</span>
                        <span className="logo-dot">
                            <span className="logo-star">✦</span>
                        </span>
                        <span className="logo-ch">ldFund</span>
                        <span className="logo-reg">®</span>
                    </div>
                    <div className="logo-country">México</div>
                    <div className="logo-sub">Fondo para Niños de México A.C.</div>
                </div>
                <button className="nav-link" onClick={() => navigate('/landing')}>← Inicio</button>
                <div></div>
            </nav>
            <div className="nav-stripe"></div>

            <div className="wrap">
                <div className="card">
                    <div className="sh">Autoridades habilitadas</div>
                    <p className="ss">
                        Tu reporte se envía a las siguientes autoridades habilitadas para recibirlo.
                    </p>

                    {loading && <p className="auth-state">Cargando autoridades…</p>}

                    {error && (
                        <p className="auth-state auth-error">
                            No se pudieron cargar las autoridades: {error}
                        </p>
                    )}

                    {!loading && !error && authorities.length === 0 && (
                        <p className="auth-state">No hay autoridades habilitadas.</p>
                    )}

                    {!loading && !error && authorities.length > 0 && (
                        <ul className="auth-list">
                            {authorities.map((a) => (
                                <li key={a.id} className="auth-item">
                                    <div className="auth-name">{a.name}</div>
                                    <a className="auth-email" href={`mailto:${a.email}`}>
                                        {a.email}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <footer className="landing-footer">
                <div className="footer-brand">
                    <b>FARO · SINAREV</b> · ChildFund México
                </div>
            </footer>
        </div>
    )
}
