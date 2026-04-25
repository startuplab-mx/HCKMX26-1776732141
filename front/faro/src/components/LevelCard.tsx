export function LevelCard({ copy }: { copy: any }) {
    const currentLevel = 4
    const points = 16

    return (
        <section className="card hero-level">
            <div className="eyebrow">{copy.heroBadge}</div>

            <div className="hero-row">

                <div className="level-copy">
                    <h2>{copy.levelTitle}</h2>
                    <p>{copy.levelDescription}</p>

                    <div className="badge-row">
                        <div className="level-badge">
                            {copy.appName} {currentLevel}
                        </div>
                        <div>
                            <strong>{copy.currentGoal}</strong> {points} reportes validados
                        </div>
                    </div>

                    <div className="progress-track" aria-hidden="true">
                        <div className="progress-bar" />
                    </div>

                    <div className="stats">
                        <div className="stat">
                            <small>{copy.currentLevel}</small>
                            <strong>{currentLevel} estrellas</strong>
                        </div>
                        <div className="stat">
                            <small>{copy.nextGoal}</small>
                            <strong>{points * 2}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}