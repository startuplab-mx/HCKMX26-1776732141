import { levels } from '../lib/levels'

export function LevelsGrid({ copy }: { copy: any }) {
    return (
        <aside className="card levels-card">
            <div className="levels-header">
                <div>
                    <h3>{copy.levelsTitle}</h3>
                    <p>{copy.levelsDesc}</p>
                </div>
            </div>

            <div className="levels-list">
                {levels.map((item) => (
                    <article className="level-item" key={item.level}>
                        <div className="stars" aria-hidden="true">
                            {'★'.repeat(item.stars)}
                        </div>
                        <strong>
                            {copy.appName === 'FARO' ? 'Nivel' : 'Level'} {item.level}
                        </strong>
                        <span>{item.points.toLocaleString(copy.appName === 'FARO' ? 'es-MX' : 'en-US')} {copy.appName === 'FARO' ? 'puntos' : 'points'}</span>
                    </article>
                ))}
            </div>
        </aside>
    )
}