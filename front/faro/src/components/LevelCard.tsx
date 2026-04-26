type Copy = {
    heroBadge: string
    levelTitle: string
    levelDescription: string
    appName: string
    currentGoal: string
    currentLevel: string
    nextGoal: string
}

/**
 * Progression follows powers of two: level N requires 2^N validated reports.
 * Level 0 = 1 report, Level 1 = 2, ..., Level 4 = 16, Level 5 = 32, etc.
 */
function deriveLevel(validatedReports: number) {
    const safe = Math.max(0, validatedReports)
    const level = safe < 1 ? 0 : Math.floor(Math.log2(safe)) + 1
    const currentThreshold = level <= 0 ? 0 : Math.pow(2, level - 1)
    const nextThreshold = Math.pow(2, level)
    const progressInLevel = safe - currentThreshold
    const span = Math.max(1, nextThreshold - currentThreshold)
    const progressPct = Math.min(100, Math.round((progressInLevel / span) * 100))
    return { level, currentThreshold, nextThreshold, progressPct }
}

export function LevelCard({
    copy,
    validatedReports,
}: {
    copy: Copy
    validatedReports: number
}) {
    const { level, nextThreshold, progressPct } = deriveLevel(validatedReports)
    const stars = '★'.repeat(level)

    return (
        <section className="card hero-level" data-tutorial="profile">
            <div className="eyebrow">{copy.heroBadge}</div>
            <div className="hero-row">
                <div className="mascot-box">
                    <img src="/assets/landing-hero.jpg" alt="Mascota de FARO con escudo y estrella" />
                </div>
                <div className="level-copy">
                    <h2>{copy.levelTitle}</h2>
                    <p>{copy.levelDescription}</p>
                    <div className="badge-row">
                        <div className="level-badge">
                            {copy.appName} {level}
                        </div>
                        <div>
                            <strong>{copy.currentGoal}</strong> {validatedReports} reportes validados
                        </div>
                    </div>
                    <div
                        className="stars-row"
                        aria-label={`Nivel ${level} con ${level} estrellas`}
                    >
                        {stars || '☆'}
                    </div>
                    <div className="progress-track" aria-hidden="true">
                        <div className="progress-bar" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="stats">
                        <div className="stat">
                            <small>{copy.currentLevel}</small>
                            <strong>{level} estrellas</strong>
                        </div>
                        <div className="stat">
                            <small>{copy.nextGoal}</small>
                            <strong>{nextThreshold}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
