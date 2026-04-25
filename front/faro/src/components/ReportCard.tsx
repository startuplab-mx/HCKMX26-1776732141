export function ReportCard({ copy }: { copy: any }) {
    return (
        <section className="card report-card">
            <h3>{copy.reportTitle}</h3>
            <p>{copy.reportDescription}</p>

            <label className="field-label" htmlFor="report-url">
                {copy.urlLabel}
            </label>

            <div className="input-wrap">
                <span aria-hidden="true">🔗</span>
                <input id="report-url" type="url" placeholder="https://..." />
            </div>

            <div className="actions">
                <button className="btn btn-primary" type="button">
                    {copy.sendButton}
                </button>
                <button className="btn btn-secondary" type="button">
                    {copy.helpButton}
                </button>
            </div>

            <div className="privacy">
                <span aria-hidden="true">🛡️</span>
                <div>
                    <strong>{copy.privacyTitle}</strong> {copy.privacyBody}
                </div>
            </div>
        </section>
    )
}