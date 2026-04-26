import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
    confirmReportEvidence,
    getReportDetail,
    listReportSummaries,
    markReportAddressed,
    reviewReport,
    type DangerLevel,
    type ReportDetail,
    type ReportSummary,
} from '../../lib/api'
import { getSession } from '../../lib/auth'
import { AdminLayout } from './AdminLayout'
import '../../styles/admin.css'

const DANGER_LABEL: Record<DangerLevel, string> = {
    DANGER: 'Peligro',
    WARNING: 'Zona intermedia',
    GRAY: 'Zona gris',
}

export function ReportsPage() {
    const session = getSession()
    const [reports, setReports] = useState<ReportSummary[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [openDetail, setOpenDetail] = useState<{ summary: ReportSummary; detail: ReportDetail | null } | null>(null)

    async function reload() {
        try {
            const data = await listReportSummaries()
            setReports(data)
            setError(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar reportes')
        }
    }

    useEffect(() => {
        if (!session) return
        void reload()
    }, [session])

    if (!session) return <Navigate to="/login" replace />

    async function runAction(id: number, action: 'confirm' | 'addressed') {
        const key = `${id}:${action}`
        setBusyId(key)
        try {
            if (action === 'confirm') await confirmReportEvidence(id)
            else await markReportAddressed(id)
            await reload()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al actualizar el reporte')
        } finally {
            setBusyId(null)
        }
    }

    async function openReview(summary: ReportSummary) {
        setBusyId(`${summary.id}:review`)
        setOpenDetail({ summary, detail: null })
        try {
            const detail = await getReportDetail(summary.id)
            setOpenDetail({ summary, detail })
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar el reporte')
            setOpenDetail(null)
        } finally {
            setBusyId(null)
        }
    }

    async function closeReview() {
        if (!openDetail) return
        const wasReviewed = openDetail.summary.reviewed
        setOpenDetail(null)
        if (!wasReviewed) {
            try {
                await reviewReport(openDetail.summary.id)
                await reload()
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error al marcar revisado')
            }
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page-head">
                <h1>Consultar reportes</h1>
                <p>Reportes recibidos con nivel de peligro detectado por la huella digital.</p>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {!reports && !error && <div className="admin-loading">Cargando reportes…</div>}

            {reports && reports.length === 0 && (
                <div className="admin-card" style={{ marginTop: '1rem' }}>
                    <p className="ss">No hay reportes registrados todavía.</p>
                </div>
            )}

            {reports && reports.length > 0 && (
                <div className="admin-card admin-table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha de reporte</th>
                                <th>Estado</th>
                                <th>Peligro</th>
                                <th>Evidencias</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((r) => (
                                <tr key={r.id}>
                                    <td>#{r.id}</td>
                                    <td>{formatDate(r.filed ?? r.created)}</td>
                                    <td>
                                        <span className="status-pill">{r.status}</span>
                                    </td>
                                    <td>
                                        <span className={`danger-pill danger-${r.dangerLevel.toLowerCase()}`}>
                                            {DANGER_LABEL[r.dangerLevel]}
                                        </span>
                                    </td>
                                    <td>
                                        {r.evidenceCount}
                                        {r.dangerousEvidenceCount > 0 && (
                                            <span className="danger-count">
                                                {' '}
                                                ({r.dangerousEvidenceCount} peligro)
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-row">
                                            <button
                                                className={`action-btn ${r.reviewed ? 'action-btn-done' : ''}`}
                                                disabled={busyId === `${r.id}:review`}
                                                onClick={() => openReview(r)}
                                            >
                                                {busyId === `${r.id}:review` ? '…' : r.reviewed ? '✓ Revisado' : 'Revisar'}
                                            </button>
                                            <ActionButton
                                                done={r.evidenceConfirmed}
                                                busy={busyId === `${r.id}:confirm`}
                                                onClick={() => runAction(r.id, 'confirm')}
                                                label="Confirmar evidencia"
                                                doneLabel="Confirmada"
                                            />
                                            <ActionButton
                                                done={r.addressed}
                                                busy={busyId === `${r.id}:addressed`}
                                                onClick={() => runAction(r.id, 'addressed')}
                                                label="Atendido"
                                                doneLabel="Atendido"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {openDetail && (
                <ReviewModal
                    summary={openDetail.summary}
                    detail={openDetail.detail}
                    onClose={closeReview}
                />
            )}
        </AdminLayout>
    )
}

function ActionButton({
    done,
    busy,
    onClick,
    label,
    doneLabel,
}: {
    done: boolean
    busy: boolean
    onClick: () => void
    label: string
    doneLabel: string
}) {
    if (done) return <span className="action-done">✓ {doneLabel}</span>
    return (
        <button className="action-btn" disabled={busy} onClick={onClick}>
            {busy ? '…' : label}
        </button>
    )
}

function ReviewModal({
    summary,
    detail,
    onClose,
}: {
    summary: ReportSummary
    detail: ReportDetail | null
    onClose: () => void
}) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <div>
                        <h2>Reporte #{summary.id}</h2>
                        <div className="modal-sub">
                            {formatDate(summary.filed ?? summary.created)} ·{' '}
                            <span className={`danger-pill danger-${summary.dangerLevel.toLowerCase()}`}>
                                {DANGER_LABEL[summary.dangerLevel]}
                            </span>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {!detail && <p className="ss">Cargando respuestas…</p>}

                    {detail && (
                        <>
                            <h3 className="modal-section-title">Respuestas</h3>
                            {detail.answers.length === 0 ? (
                                <p className="ss">Este reporte no tiene respuestas registradas.</p>
                            ) : (
                                <ul className="answer-list">
                                    {detail.answers.map((a) => (
                                        <li key={a.questionId} className="answer-item">
                                            <div className="answer-q">{a.questionText}</div>
                                            <div className="answer-r">{a.response || <em>(sin respuesta)</em>}</div>
                                            <div className="answer-meta">{a.responseType}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <h3 className="modal-section-title">Evidencia</h3>
                            {detail.evidence.length === 0 ? (
                                <p className="ss">No se adjuntó evidencia.</p>
                            ) : (
                                <ul className="evidence-list">
                                    {detail.evidence.map((e) => (
                                        <li key={e.id}>
                                            <span className="evidence-name">{e.filename || `evidencia #${e.id}`}</span>
                                            <span
                                                className={`danger-pill danger-${e.dangerous ? 'danger' : 'gray'}`}
                                                style={{ marginLeft: 8 }}
                                            >
                                                {e.dangerous ? 'Peligro' : 'OK'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>

                <div className="modal-foot">
                    <button className="action-btn" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

function formatDate(iso: string) {
    if (!iso) return '—'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}
