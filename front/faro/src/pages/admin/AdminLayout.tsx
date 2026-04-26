import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../../lib/auth'

type MenuItem = { to: string; label: string; icon: string }

const ADMIN_MENU: MenuItem[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/reports', label: 'Consultar reportes', icon: '📝' },
    { to: '/admin/authorities', label: 'Administrar autoridades', icon: '🏛️' },
    { to: '/admin/forms', label: 'Administrar formularios', icon: '📋' },
]

const AUTHORITY_MENU: MenuItem[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/reports', label: 'Consultar reportes', icon: '📝' },
]

export function AdminLayout({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const session = getSession()
    const menu = session?.role === 'ADMIN' ? ADMIN_MENU : AUTHORITY_MENU

    function logout() {
        clearSession()
        navigate('/login')
    }

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-title">FARO</div>
                    <div className="admin-brand-sub">Panel administrativo</div>
                </div>
                <nav className="admin-menu">
                    {menu.map((item) => (
                        <NavLink key={item.to} to={item.to} className="admin-link">
                            {item.icon} {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="admin-user">
                    {session && (
                        <>
                            <div className="admin-user-name">{session.username}</div>
                            <div className="admin-user-role">{session.role}</div>
                        </>
                    )}
                    <button className="admin-logout" onClick={logout}>Cerrar sesión</button>
                </div>
            </aside>
            <main className="admin-main">{children}</main>
        </div>
    )
}
