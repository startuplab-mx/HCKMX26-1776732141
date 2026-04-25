import { Navigate, Route, Routes } from 'react-router-dom'
import { FaroEsMxPage } from './pages/es-mx/FaroEsMxPage'
import { FaroEnPage } from './pages/en/FaroEnPage'

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/es-mx" replace />} />
        <Route path="/es-mx" element={<FaroEsMxPage />} />
        <Route path="/en" element={<FaroEnPage />} />
      </Routes>
  )
}