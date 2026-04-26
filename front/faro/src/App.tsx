import { Navigate, Route, Routes } from 'react-router-dom'
import { FaroEsMxPage } from './pages/es-mx/FaroEsMxPage'
import { FaroEnPage } from './pages/en/FaroEnPage'
import { ReportSuccessPage } from './pages/es-mx/ReportSuccessPage'
import { LandingPage } from './pages/es-mx/LandingPage'
import { ReportFlowPage } from './pages/es-mx/ReportFlowPage'
import { AuthoritiesPage } from './pages/es-mx/AuthoritiesPage'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ReportsPage } from './pages/admin/ReportsPage'
import { AdminAuthoritiesPage } from './pages/admin/AdminAuthoritiesPage'
import { AdminFormsPage } from './pages/admin/AdminFormsPage'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/reportar" element={<ReportFlowPage />} />
            <Route path="/autoridades" element={<AuthoritiesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/authorities" element={<AdminAuthoritiesPage />} />
            <Route path="/admin/forms" element={<AdminFormsPage />} />
            <Route path="/es-mx" element={<FaroEsMxPage />} />
            <Route path="/en" element={<FaroEnPage />} />
            <Route path="/es-mx/success" element={<ReportSuccessPage />} />
        </Routes>
    )
}