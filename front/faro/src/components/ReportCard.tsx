import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export function ReportCard({ copy }: { copy: Copy }) {
    const navigate = useNavigate()
    const [age, setAge] = useState('')
    const [recruitment, setRecruitment] = useState('')
    const [contentKnowledge, setContentKnowledge] = useState('')
    const [distribution, setDistribution] = useState<string[]>([])
    const [url, setUrl] = useState('')
    const [files, setFiles] = useState<FileList | null>(null)

    const canSubmit = useMemo(() => {
        return age && recruitment && contentKnowledge
    }, [age, recruitment, contentKnowledge])

    const toggleDistribution = (value: string) => {
        setDistribution((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        )
    }

    return (
        <section className="card report-card">
            <h3>{copy.reportTitle}</h3>
            <p>{copy.reportDescription}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    console.log({
                        age,
                        recruitment,
                        contentKnowledge,
                        distribution,
                        url,
                        files,
                    })
                    navigate('/es-mx/success')
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
                    <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                        {copy.sendButton}
                    </button>
                    <button className="btn btn-secondary" type="button">
                        {copy.helpButton}
                    </button>
                </div>
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