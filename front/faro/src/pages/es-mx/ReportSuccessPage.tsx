import { Link } from 'react-router-dom'

export function ReportSuccessPage() {
    return (
        <main className="app">
            <section className="card success-card">
                <div className="eyebrow">✅ Reporte recibido</div>
                <h1>Tu reporte fue recibido correctamente</h1>
                <p>
                    El caso será analizado y, si corresponde, será revisado y escalado al equipo correspondiente.
                </p>

                <div className="success-box">
                    <strong>¿Qué sigue?</strong>
                    <ul>
                        <li>Revisión del reporte.</li>
                        <li>Validación de la evidencia.</li>
                        <li>Escalamiento al equipo correspondiente cuando aplique.</li>
                    </ul>
                </div>

                <Link className="btn btn-primary" to="/es-mx">
                    Volver al inicio
                </Link>
            </section>
        </main>
    )
}