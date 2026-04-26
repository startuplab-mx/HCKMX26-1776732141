import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LevelCard } from '../../components/LevelCard'
import { ReportCard } from '../../components/ReportCard'
import { hasSeenTutorial, Tutorial, type TutorialStep } from '../../components/Tutorial'
import { getProfileStats } from '../../lib/api'
import { copyEsMx } from '../../lib/copy'
import { getOrCreateProfileId } from '../../lib/profile'
import '../../styles/tutorial.css'

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        selector: '[data-tutorial="profile"]',
        text: 'Hola, soy tu ayuda. Aquí podrás ver tus estadísticas.',
    },
    {
        selector: '[data-tutorial="report"]',
        text: 'Y aquí podrás llenar el reporte.',
    },
    {
        selector: '[data-tutorial="submit"]',
        text: 'Una vez finalizado, da clic aquí.',
    },
]

export function FaroEsMxPage() {
    const navigate = useNavigate()
    const [profileId] = useState<string>(() => getOrCreateProfileId())
    const [validated, setValidated] = useState<number>(0)
    const [qualityStars, setQualityStars] = useState<number>(0)
    const [showTutorial, setShowTutorial] = useState<boolean>(() => !hasSeenTutorial())

    async function reloadStats() {
        try {
            const stats = await getProfileStats(profileId)
            setValidated(stats.validatedReports)
        } catch {
            // ignore — landing should still render with 0
        }
    }

    useEffect(() => {
        void reloadStats()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId])

    return (
        <main className="app">
            <header className="topbar">
                <div className="brand">
                    <img className="logo" src="/assets/faro-logo.jpg" alt="Logo de FARO" />
                    <div>
                        <h1>{copyEsMx.appName}</h1>
                        <p>{copyEsMx.tagline}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => setShowTutorial(true)}
                    >
                        ? Tutorial
                    </button>
                    <button
                        className="btn btn-secondary topbar-home"
                        type="button"
                        onClick={() => navigate('/landing')}
                    >
                        ← Inicio
                    </button>
                </div>
            </header>

            <div className="grid">
                <div>
                    <LevelCard
                        copy={copyEsMx}
                        validatedReports={validated}
                        qualityStars={qualityStars}
                    />
                    <ReportCard
                        copy={copyEsMx}
                        profileId={profileId}
                        onSubmitted={reloadStats}
                        onHelp={() => setShowTutorial(true)}
                        onQualityChange={setQualityStars}
                    />
                </div>
            </div>

            <p className="footer-note">{copyEsMx.footer}</p>

            {showTutorial && (
                <Tutorial steps={TUTORIAL_STEPS} onClose={() => setShowTutorial(false)} />
            )}
        </main>
    )
}
