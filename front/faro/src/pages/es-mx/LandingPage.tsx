import { useNavigate } from 'react-router-dom'
import '../../styles/landing.css'

export function LandingPage() {
    const navigate = useNavigate()
    const goToEsMx = () => navigate('/es-mx')
    const goToReport = () => navigate('/reportar')

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
                <div className="nav-links">
                    <button className="nav-link">Inicio</button>
                    <button className="nav-link">Nosotros</button>
                    <button className="nav-link" onClick={() => navigate('/autoridades')}>Autoridades</button>
                    <button className="nav-link">Preguntas</button>
                    <button className="nav-link" onClick={() => navigate('/login')}>Iniciar sesión</button>
                </div>
            </nav>
            <div className="nav-stripe"></div>

            <section className="hero-section">
                <div className="hero-img">
                    <img
                        className="hero-img-content"
                        src="/assets/landing-hero.jpg"
                        alt="Mascota de FARO con lupa"
                    />
                </div>
                <div className="hero-text">
                    <h1>FARO</h1>
                    <p>
                        Un espacio seguro y confidencial para reportar casos de reclutamiento contra niñas, niños y
                        adolescentes en México.
                    </p>
                    <button className="btn-hero" onClick={goToEsMx}>
                        Hacer Reporte
                    </button>
                </div>
            </section>

            <div className="divider-line"></div>

            <section className="video-section">
                <div className="video-box">
                    <div className="play-btn"></div>
                </div>
                <div className="video-text">
                    <h2>¿Cómo hacer un reporte?</h2>
                    <p>
                        Si identificas una situación de reclutamiento forzado o contenido que ponga en riesgo a niñas,
                        niños y adolescentes, puedes reportarlo de forma segura y confidencial a través de este sistema.
                    </p>
                </div>
            </section>

            <div className="divider-line"></div>

            <section className="report-section">
                <h2>¿Necesitas reportar un incidente?</h2>
                <p>
                    El proceso toma menos de 5 minutos. Tu información será enviada directamente a las autoridades
                    correspondientes.
                </p>
                <button className="btn-report" onClick={goToReport}>
                    Reportar incidente como persona mayor de edad
                </button>
            </section>

            <footer className="landing-footer">
                <div className="footer-brand">
                    <b>SINAREV · FARO</b> · ChildFund México
                </div>
                <div className="footer-rights">Todos los derechos reservados</div>
            </footer>
        </div>
    )
}
