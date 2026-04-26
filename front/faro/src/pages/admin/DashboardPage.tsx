import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getStats, type Stats } from '../../lib/api'
import { getSession } from '../../lib/auth'
import { AdminLayout } from './AdminLayout'
import '../../styles/admin.css'

export function DashboardPage() {
    const session = getSession()
    const [stats, setStats] = useState<Stats | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!session) return
        let cancelled = false
        getStats()
            .then((s) => !cancelled && setStats(s))
            .catch((e: Error) => !cancelled && setError(e.message))
        return () => {
            cancelled = true
        }
    }, [session])

    if (!session) return <Navigate to="/login" replace />

    return (
        <AdminLayout>
            <div className="admin-page-head">
                <h1>Dashboard</h1>
                <p>Resumen agregado de reportes y evidencia procesada.</p>
            </div>

            {error && <div className="admin-error">No se pudieron cargar las métricas: {error}</div>}

            {!stats && !error && <div className="admin-loading">Cargando métricas…</div>}

            {stats && (
                <div className="admin-grid">
                    <KpiCard label="Reportes totales" value={stats.totalReports} accent="green" />
                    <KpiCard label="Enviados a autoridades" value={stats.filedReports} accent="blue" />
                    <KpiCard label="Borradores" value={stats.draftReports} accent="gray" />
                    <KpiCard label="Evidencias analizadas" value={stats.totalEvidence} accent="green" />
                    <KpiCard
                        label="Evidencias marcadas como peligro"
                        value={stats.dangerousEvidence}
                        accent="red"
                    />

                    <div className="admin-card admin-chart-card">
                        <h3>Reportes</h3>
                        <BarChart
                            data={[
                                { label: 'Total', value: stats.totalReports, color: '#1a7a3c' },
                                { label: 'Enviados a autoridades', value: stats.filedReports, color: '#1f6fb6' },
                                { label: 'Borradores', value: stats.draftReports, color: '#9aa5b1' },
                            ]}
                        />
                    </div>

                    <div className="admin-card admin-chart-card">
                        <h3>Evidencia identificada por la huella digital</h3>
                        <BarChart
                            data={[
                                { label: 'Evidencias totales', value: stats.totalEvidence, color: '#1a7a3c' },
                                { label: 'Identificadas como peligro', value: stats.dangerousEvidence, color: '#c0392b' },
                            ]}
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

function KpiCard({
    label,
    value,
    accent,
}: {
    label: string
    value: number
    accent: 'green' | 'blue' | 'red' | 'gray'
}) {
    return (
        <div className={`admin-card admin-kpi admin-kpi-${accent}`}>
            <div className="admin-kpi-value">{value}</div>
            <div className="admin-kpi-label">{label}</div>
        </div>
    )
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const max = Math.max(1, ...data.map((d) => d.value))
    return (
        <div className="bar-chart">
            {data.map((d) => {
                const widthPct = Math.round((d.value / max) * 100)
                return (
                    <div key={d.label} className="bar-row">
                        <div className="bar-label">{d.label}</div>
                        <div className="bar-track">
                            <div
                                className="bar-fill"
                                style={{ width: `${widthPct}%`, background: d.color }}
                            />
                        </div>
                        <div className="bar-value">{d.value}</div>
                    </div>
                )
            })}
        </div>
    )
}
