import { LevelsGrid } from '../../components/LevelsGrid'
import { LevelCard } from '../../components/LevelCard'
import { ReportCard } from '../../components/ReportCard'
import { copyEn } from '../../lib/copy'

export function FaroEnPage() {
    return (
        <main className="app">
            <header className="topbar">
                <div className="brand">
                    <img className="logo" src="/assets/faro-logo.jpg" alt="BEACON logo" />
                    <div>
                        <h1>{copyEn.appName}</h1>
                        <p>{copyEn.tagline}</p>
                    </div>
                </div>
            </header>

            <div className="grid">
                <div>
                    <LevelCard copy={copyEn} />
                    <ReportCard copy={copyEn} />
                </div>

                <LevelsGrid copy={copyEn} />
            </div>

            <p className="footer-note">{copyEn.footer}</p>
        </main>
    )
}