import { LevelsGrid } from '../../components/LevelsGrid'
import { LevelCard } from '../../components/LevelCard'
import { ReportCard } from '../../components/ReportCard'
import { copyEsMx } from '../../lib/copy'

export function FaroEsMxPage() {
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
            </header>

            <div className="grid">
                <div>
                    <LevelCard copy={copyEsMx} />
                    <ReportCard copy={copyEsMx} />
                </div>

                <LevelsGrid copy={copyEsMx} />
            </div>

            <p className="footer-note">{copyEsMx.footer}</p>
        </main>
    )
}