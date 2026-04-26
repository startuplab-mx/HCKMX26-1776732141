import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    buildAnswersByOrder,
    createDraft,
    fileReport,
    fingerprintEvidence,
    getForm,
    listForms,
} from '../lib/api'

type Copy = {
    reportTitle: string
    reportDescription: string
    sendButton: string
    helpButton: string
    privacyTitle: string
    privacyBody: string
    urlLabel?: string
}

const ageOptions = ['Menos de 13', '13 a 15', '16 a 17', '18 o más']
const yesNoOptions = ['Sí', 'No']
const multiOptions = ['TikTok', 'YouTube', 'Instagram', 'Facebook', 'X', 'Otra']

type Status =
    | { kind: 'idle' }
    | { kind: 'submitting'; step: string }
    | { kind: 'error'; message: string }
    | { kind: 'success'; message: string }

export function ReportCard({
    copy,
    profileId,
    onSubmitted,
    onHelp,
    onQualityChange,
}: {
    copy: Copy
    profileId?: string
    onSubmitted?: () => void
    onHelp?: () => void
    /** Notified when the in-progress report's quality (0–5 stars) changes. */
    onQualityChange?: (stars: number) => void
}) {
    const [age, setAge] = useState('')
    const [recruitment, setRecruitment] = useState('')
    const [contentKnowledge, setContentKnowledge] = useState('')
    const [distribution, setDistribution] = useState<string[]>([])
    const [url, setUrl] = useState('')
    const [files, setFiles] = useState<FileList | null>(null)
    const [status, setStatus] = useState<Status>({ kind: 'idle' })
    const navigate = useNavigate()

    const canSubmit = useMemo(() => {
        return age && recruitment && contentKnowledge && status.kind !== 'submitting'
    }, [age, recruitment, contentKnowledge, status.kind])

    /**
     * Quality stars: one per filled question (cap at 4), plus the 5th star when evidence is attached.
     * Resets to 0 once the report has been submitted successfully.
     */
    const qualityStars = useMemo(() => {
        if (status.kind === 'success') return 0
        const filled = [
            !!age,
            !!recruitment,
            !!contentKnowledge,
            distribution.length > 0,
            url.trim().length > 0,
        ].filter(Boolean).length
        const hasFiles = !!files && files.length > 0
        return Math.min(4, filled) + (hasFiles ? 1 : 0)
    }, [age, recruitment, contentKnowledge, distribution, url, files, status.kind])

    useEffect(() => {
        onQualityChange?.(qualityStars)
    }, [qualityStars, onQualityChange])

    const toggleDistribution = (value: string) => {
        setDistribution((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        )
    }

    async function submitReport() {
        try {
            setStatus({ kind: 'submitting', step: 'Guardando borrador…' })

            const forms = await listForms()
            if (forms.length === 0) throw new Error('No hay formularios disponibles')
            const form = await getForm(forms[0].id)

            const orderedAnswers = [
                age,
                recruitment,
                contentKnowledge,
                distribution.join(', '),
                url,
            ]
            const answers = buildAnswersByOrder(form, orderedAnswers)
            const draft = await createDraft(form.id, answers, profileId)

            if (files && files.length > 0) {
                setStatus({ kind: 'submitting', step: 'Generando huella digital de la evidencia…' })
                for (const file of Array.from(files)) {
                    try {
                        await fingerprintEvidence(draft.id, file)
                    } catch (err) {
                        console.warn('Fingerprint failed for', file.name, err)
                    }
                }
            }

            setStatus({ kind: 'submitting', step: 'Enviando a las autoridades…' })
            const result = await fileReport(draft.id)
            setStatus({ kind: 'success', message: result.message })
            onSubmitted?.()
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error desconocido'
            setStatus({ kind: 'error', message })
        }
    }

    if (status.kind === 'success') {
        return (
            <section className="card report-card success-card">
                <div className="eyebrow">✅ Reporte recibido</div>
                <h3>¡Reporte enviado con éxito!</h3>
                <p>{status.message}</p>
                <div className="actions" style={{ marginTop: '1rem' }}>
                    <button className="btn btn-primary" type="button" onClick={() => navigate('/landing')}>
                        Volver al inicio
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="card report-card" data-tutorial="report">
            <h3>{copy.reportTitle}</h3>
            <p>{copy.reportDescription}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    void submitReport()
                }}
            >
                <div className="form-group">
                    <label className="field-label">¿Qué edad tienes?</label>
                    <div className="choice-list">
                        {ageOptions.map((option) => (
                            <label key={option} className="choice-pill">
                                <input
                                    type="radio"
                                    name="age"
                                    value={option}
                                    checked={age === option}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="field-label">
                        Una persona o grupo de personas intenta reclutarme.
                    </label>
                    <div className="choice-list">
                        {yesNoOptions.map((option) => (
                            <label key={option} className="choice-pill">
                                <input
                                    type="radio"
                                    name="recruitment"
                                    value={option}
                                    checked={recruitment === option}
                                    onChange={(e) => setRecruitment(e.target.value)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="field-label">
                        Tengo conocimiento de contenido en redes sociales que promueve el reclutamiento forzado de niñas, niños y adolescentes.
                    </label>
                    <div className="choice-list">
                        {yesNoOptions.map((option) => (
                            <label key={option} className="choice-pill">
                                <input
                                    type="radio"
                                    name="contentKnowledge"
                                    value={option}
                                    checked={contentKnowledge === option}
                                    onChange={(e) => setContentKnowledge(e.target.value)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="field-label">
                        El contenido reportado se difunde a través de:
                    </label>
                    <div className="choice-list">
                        {multiOptions.map((option) => (
                            <label key={option} className="choice-pill">
                                <input
                                    type="checkbox"
                                    name="distribution"
                                    value={option}
                                    checked={distribution.includes(option)}
                                    onChange={() => toggleDistribution(option)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="field-label" htmlFor="report-url">
                        Si tienes la url del contenido reportado por favor agrégala.
                    </label>
                    <div className="input-wrap">
                        <span aria-hidden="true">🔗</span>
                        <input
                            id="report-url"
                            type="url"
                            placeholder="https://..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="field-label" htmlFor="report-files">
                        Si tienes alguna otra evidencia, por favor agregarlas.
                    </label>
                    <input
                        id="report-files"
                        type="file"
                        multiple
                        onChange={(e) => setFiles(e.target.files)}
                    />
                </div>

                <div className="actions">
                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={!canSubmit}
                        data-tutorial="submit"
                    >
                        {status.kind === 'submitting' ? status.step : copy.sendButton}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={onHelp}>
                        {copy.helpButton}
                    </button>
                </div>

                {status.kind === 'error' && (
                    <p className="report-error" role="alert">
                        No se pudo enviar el reporte: {status.message}
                    </p>
                )}
            </form>

            <div className="privacy">
                <span aria-hidden="true">🛡️</span>
                <div>
                    <strong>{copy.privacyTitle}</strong> {copy.privacyBody}
                </div>
            </div>
        </section>
    )
}