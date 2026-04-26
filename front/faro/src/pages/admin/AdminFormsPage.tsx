import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
    addQuestion,
    createForm,
    deleteForm,
    deleteQuestion,
    listForms,
    type Form,
    type ResponseType,
} from '../../lib/api'
import { getSession } from '../../lib/auth'
import { AdminLayout } from './AdminLayout'
import '../../styles/admin.css'

const RESPONSE_TYPES: ResponseType[] = ['TEXT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'URL', 'FILE']
const TARGET_TYPES = ['AGE', 'GENDER']

export function AdminFormsPage() {
    const session = getSession()
    const [forms, setForms] = useState<Form[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
    const [expanded, setExpanded] = useState<number | null>(null)

    const [draft, setDraft] = useState({
        description: '',
        targetType: 'AGE',
        targetValue: '',
    })

    async function reload() {
        try {
            setForms(await listForms())
            setError(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar formularios')
        }
    }

    useEffect(() => {
        if (!session) return
        void reload()
    }, [session])

    if (!session) return <Navigate to="/login" replace />
    if (session.role !== 'ADMIN')
        return (
            <AdminLayout>
                <div className="admin-error">No tienes permisos para esta sección.</div>
            </AdminLayout>
        )

    async function handleCreateForm(e: React.FormEvent) {
        e.preventDefault()
        if (!draft.description.trim() || !draft.targetValue.trim()) return
        setBusy('new-form')
        try {
            await createForm({
                description: draft.description,
                targetType: draft.targetType,
                targetValue: draft.targetValue,
                questions: [],
            })
            setDraft({ description: '', targetType: 'AGE', targetValue: '' })
            await reload()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al crear formulario')
        } finally {
            setBusy(null)
        }
    }

    async function handleDeleteForm(id: number) {
        if (!confirm('¿Eliminar este formulario y todas sus preguntas?')) return
        setBusy(`del-form-${id}`)
        try {
            await deleteForm(id)
            if (expanded === id) setExpanded(null)
            await reload()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al eliminar')
        } finally {
            setBusy(null)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page-head">
                <h1>Administrar formularios</h1>
                <p>Gestiona los formularios de reporte y sus preguntas.</p>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-card" style={{ marginTop: '1rem' }}>
                <h3 className="admin-section-title">Crear formulario</h3>
                <form className="admin-inline-form" onSubmit={handleCreateForm}>
                    <div className="fg" style={{ flex: 2 }}>
                        <label>Descripción</label>
                        <input
                            type="text"
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="fg">
                        <label>Tipo</label>
                        <select
                            value={draft.targetType}
                            onChange={(e) => setDraft({ ...draft, targetType: e.target.value })}
                        >
                            {TARGET_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="fg">
                        <label>Valor</label>
                        <input
                            type="text"
                            placeholder="18+, 12-17…"
                            value={draft.targetValue}
                            onChange={(e) => setDraft({ ...draft, targetValue: e.target.value })}
                            required
                        />
                    </div>
                    <button className="action-btn" type="submit" disabled={busy === 'new-form'}>
                        {busy === 'new-form' ? '…' : 'Crear'}
                    </button>
                </form>
            </div>

            {!forms && !error && <div className="admin-loading">Cargando formularios…</div>}

            {forms && forms.length === 0 && (
                <div className="admin-card" style={{ marginTop: '1rem' }}>
                    <p className="ss">No hay formularios registrados.</p>
                </div>
            )}

            {forms && forms.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                    {forms.map((f) => (
                        <FormRow
                            key={f.id}
                            form={f}
                            isExpanded={expanded === f.id}
                            onToggle={() => setExpanded(expanded === f.id ? null : f.id)}
                            onDelete={() => handleDeleteForm(f.id)}
                            busy={busy}
                            setBusy={setBusy}
                            onChanged={reload}
                            onError={setError}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    )
}

function FormRow({
    form,
    isExpanded,
    onToggle,
    onDelete,
    busy,
    setBusy,
    onChanged,
    onError,
}: {
    form: Form
    isExpanded: boolean
    onToggle: () => void
    onDelete: () => void
    busy: string | null
    setBusy: (s: string | null) => void
    onChanged: () => Promise<void>
    onError: (s: string) => void
}) {
    const [newQ, setNewQ] = useState({
        question: '',
        responseType: 'SINGLE_CHOICE' as ResponseType,
        openEnded: false,
    })

    async function handleAddQuestion(e: React.FormEvent) {
        e.preventDefault()
        if (!newQ.question.trim()) return
        setBusy(`add-q-${form.id}`)
        try {
            await addQuestion(form.id, newQ)
            setNewQ({ question: '', responseType: 'SINGLE_CHOICE', openEnded: false })
            await onChanged()
        } catch (e) {
            onError(e instanceof Error ? e.message : 'Error al agregar pregunta')
        } finally {
            setBusy(null)
        }
    }

    async function handleDeleteQuestion(qid: number) {
        setBusy(`del-q-${qid}`)
        try {
            await deleteQuestion(form.id, qid)
            await onChanged()
        } catch (e) {
            onError(e instanceof Error ? e.message : 'Error al eliminar pregunta')
        } finally {
            setBusy(null)
        }
    }

    const sortedQuestions = [...form.questions].sort((a, b) => a.orderIndex - b.orderIndex)

    return (
        <div className="admin-card">
            <div className="form-row-head">
                <div>
                    <div className="form-row-title">{form.description}</div>
                    <div className="form-row-meta">
                        {form.targetType} · {form.targetValue} · {form.questions.length} pregunta(s)
                    </div>
                </div>
                <div className="action-row">
                    <button className="action-btn" onClick={onToggle}>
                        {isExpanded ? 'Ocultar' : 'Ver preguntas'}
                    </button>
                    <button
                        className="action-btn action-btn-danger"
                        disabled={busy === `del-form-${form.id}`}
                        onClick={onDelete}
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="form-questions">
                    {sortedQuestions.length === 0 && (
                        <p className="ss">Este formulario no tiene preguntas todavía.</p>
                    )}
                    {sortedQuestions.length > 0 && (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Pregunta</th>
                                    <th>Tipo</th>
                                    <th>Abierta</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedQuestions.map((q) => (
                                    <tr key={q.id}>
                                        <td>{q.orderIndex}</td>
                                        <td>{q.question}</td>
                                        <td>
                                            <span className="status-pill">{q.responseType}</span>
                                        </td>
                                        <td>{q.openEnded ? 'Sí' : 'No'}</td>
                                        <td>
                                            <button
                                                className="action-btn action-btn-danger"
                                                disabled={busy === `del-q-${q.id}`}
                                                onClick={() => handleDeleteQuestion(q.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <form className="admin-inline-form" style={{ marginTop: '1rem' }} onSubmit={handleAddQuestion}>
                        <div className="fg" style={{ flex: 2 }}>
                            <label>Nueva pregunta</label>
                            <input
                                type="text"
                                value={newQ.question}
                                onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>Tipo de respuesta</label>
                            <select
                                value={newQ.responseType}
                                onChange={(e) =>
                                    setNewQ({ ...newQ, responseType: e.target.value as ResponseType })
                                }
                            >
                                {RESPONSE_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <label className="ropt" style={{ alignSelf: 'flex-end', marginBottom: 0 }}>
                            <input
                                type="checkbox"
                                checked={newQ.openEnded}
                                onChange={(e) => setNewQ({ ...newQ, openEnded: e.target.checked })}
                            />
                            <span>Abierta</span>
                        </label>
                        <button
                            className="action-btn"
                            type="submit"
                            disabled={busy === `add-q-${form.id}`}
                        >
                            {busy === `add-q-${form.id}` ? '…' : 'Agregar'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
