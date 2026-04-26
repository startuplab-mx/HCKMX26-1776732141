export function LevelCard({ copy }: { copy: any }) {
  const currentLevel = 4
  const points = 16
  const stars = '★'.repeat(currentLevel)

  return (
    <section className="card hero-level">
      <div className="eyebrow">{copy.heroBadge}</div>
      <div className="hero-row">
        <div className="mascot-box">
          <img src="/assets/mascota-faro.jpg" alt="Mascota de FARO con escudo y estrella" />
        </div>
        <div className="level-copy">
          <h2>{copy.levelTitle}</h2>
          <p>{copy.levelDescription}</p>
          <div className="badge-row">
            <div className="level-badge">{copy.appName} {currentLevel}</div>
            <div><strong>{copy.currentGoal}</strong> {points} reportes validados</div>
          </div>
          <div className="stars-row" aria-label={`Nivel ${currentLevel} con ${currentLevel} estrellas`}>
            {stars}
          </div>
          <div className="progress-track" aria-hidden="true"><div className="progress-bar" style={{ width: '50%' }} /></div>
          <div className="stats">
            <div className="stat"><small>{copy.currentLevel}</small><strong>{currentLevel} estrellas</strong></div>
            <div className="stat"><small>{copy.nextGoal}</small><strong>{points * 2}</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}
