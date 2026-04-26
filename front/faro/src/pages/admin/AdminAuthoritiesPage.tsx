import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
    createAuthority,
    deleteAuthority,
    listAllAuthorities,
    updateAuthority,
    type Authority,
} from '../../lib/api'
import { getSession } from '../../lib/auth'
import { AdminLayout } from './AdminLayout'
import '../../styles/admin.css'

export function AdminAuthoritiesPage() {
    const session = getSession()
    const [items, setItems] = useState<Authority[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [busyId, setBusyId] = useState<number | 'new' | null>(null)
    const [draft, setDraft] = useState({ name: '', email: '' })

    async function reload() {
        try {
            setItems(await listAllAuthorities())
            setError(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar autoridades')
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

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!draft.name.trim() || !draft.email.trim()) return
        setBusyId('new')
        try {
            await createAuthority({ name: draft.name, email: draft.email, enabled: true })
            setDraft({ name: '', email: '' })
            await reload()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al crear autoridad')
        } finally {
            setBusyId(null)
        }
    }

    async function toggle(a: Authority) {
        setBusyId(a.id)
        try {
            await updateAuthority(a.id, { name: a.name, email: a.email, enabled: !a.enabled })
            await reload()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al actualizar autoridad')
        } finally {
            setBusyId(null)
        }
    }

    async function remove(id: number) {
        if (!confirm('¿Eliminar esta autoridad?')) return
        setBusyId(id)
        try {
            await deleteAuthority(id)
            await reload()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al eliminar')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page-head">
                <h1>Administrar autoridades</h1>
                <p>Gestiona las autoridades a las que se notifican los reportes.</p>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-card" style={{ marginTop: '1rem' }}>
                <h3 className="admin-section-title">Agregar autoridad</h3>
                <form className="admin-inline-form" onSubmit={handleCreate}>
                    <div className="fg" style={{ flex: 1 }}>
                        <label>Nombre</label>
                        <input
                            type="text"
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="fg" style={{ flex: 1 }}>
                        <label>Correo</label>
                        <input
                            type="email"
                            value={draft.email}
                            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                            required
                        />
                    </div>
                    <button className="action-btn" type="submit" disabled={busyId === 'new'}>
                        {busyId === 'new' ? '…' : 'Agregar'}
                    </button>
                </form>
            </div>

            {!items && !error && <div className="admin-loading">Cargando autoridades…</div>}

            {items && (
                <div className="admin-card admin-table-card" style={{ marginTop: '1rem' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.name}</td>
                                    <td>{a.email}</td>
                                    <td>
                                        <span className={`danger-pill ${a.enabled ? 'danger-warning' : 'danger-gray'}`}>
                                            {a.enabled ? 'Habilitada' : 'Deshabilitada'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-row">
                                            <button
                                                className="action-btn"
                                                disabled={busyId === a.id}
                                                onClick={() => toggle(a)}
                                            >
                                                {a.enabled ? 'Deshabilitar' : 'Habilitar'}
                                            </button>
                                            <button
                                                className="action-btn action-btn-danger"
                                                disabled={busyId === a.id}
                                                onClick={() => remove(a.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    )
}
