import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../lib/api'
import { saveSession } from '../../lib/auth'
import '../../styles/landing.css'
import '../../styles/report-flow.css'
import '../../styles/admin.css'

export function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setBusy(true)
        try {
            const result = await login(username, password)
            saveSession(result)
            navigate('/admin/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="landing">
            <nav className="navbar">
                <div className="nav-logo">
                    <img className="nav-logo-img" src="/assets/childfund-logo.jpg" alt="ChildFund" />
                    <div className="logo-country">México</div>
                </div>
                <button className="nav-link" onClick={() => navigate('/landing')}>← Inicio</button>
                <div></div>
            </nav>
            <div className="nav-stripe"></div>

            <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <form className="card" style={{ maxWidth: 420, width: '100%' }} onSubmit={handleSubmit}>
                    <div className="sh">Iniciar sesión</div>
                    <p className="ss">Acceso para administradores y autoridades. Tu rol se determina por las credenciales.</p>

                    <div className="fg">
                        <label>Usuario</label>
                        <input
                            type="text"
                            placeholder="usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="fg">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="ss" style={{ color: '#b03030' }}>
                            {error}
                        </p>
                    )}

                    <button className="btn-main" type="submit" disabled={busy} style={{ width: '100%' }}>
                        {busy ? 'Ingresando…' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>

            <footer className="landing-footer">
                <div className="footer-brand"><b>FARO · SINAREV</b> · ChildFund México</div>
            </footer>
        </div>
    )
}
