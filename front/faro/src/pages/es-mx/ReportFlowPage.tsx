import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/landing.css'
import '../../styles/report-flow.css'
import {
    createDraft,
    fileReport,
    fingerprintEvidence,
    getForm,
    listForms,
    type Answer,
    type Form,
    type Question,
} from '../../lib/api'

type Screen = 'loading' | 'form' | 'success' | 'fatal'

const STEPS = ['Tipo de incidente', 'Datos de contacto', 'Evidencia', 'Enviar']
const SOCIAL_NETWORKS = ['TikTok', 'Facebook', 'Instagram', 'X', 'WhatsApp', 'Telegram', 'Otra']
const YES_NO = ['Sí', 'No']

const TARGET_VALUE = '18+'

function Logo() {
    return (
        <div className="nav-logo">
            <div className="nav-logo-mark">
                <span className="logo-ch">Ch</span>
                <span className="logo-dot">
                    <span className="logo-star">✦</span>
                </span>
                <span className="logo-ch">ldFund</span>
                <span className="logo-reg">®</span>
            </div>
            <div className="logo-country">México</div>
            <div className="logo-sub">Fondo para Niños de México A.C.</div>
        </div>
    )
}

function Footer() {
    return (
        <footer className="landing-footer">
            <div className="footer-brand">
                <b>FARO · SINAREV</b> · ChildFund México
            </div>
        </footer>
    )
}

function Stepper({ current }: { current: number }) {
    return (
        <div className="steps">
            {STEPS.map((label, idx) => {
                const stepNum = idx + 1
                const state = stepNum < current ? 'done' : stepNum === current ? 'act' : 'pend'
                return (
                    <div key={stepNum} className="step-item">
                        <div className="si">
                            <div className={`sc ${state}`}>{stepNum}</div>
                            <span className={`sl ${state === 'act' ? 'act' : ''}`}>{label}</span>
                        </div>
                        {idx < STEPS.length - 1 && <div className={`scon ${stepNum < current ? 'done' : ''}`} />}
                    </div>
                )
            })}
        </div>
    )
}

const isAgeQuestion = (q: Question) => /edad/i.test(q.question)

function partitionQuestions(form: Form) {
    const sorted = [...form.questions].sort((a, b) => a.orderIndex - b.orderIndex)
    const incident: Question[] = []
    const evidence: Question[] = []
    for (const q of sorted) {
        if (isAgeQuestion(q)) continue // pre-filled
        if (q.responseType === 'SINGLE_CHOICE' || q.responseType === 'MULTI_CHOICE') {
            incident.push(q)
        } else {
            evidence.push(q)
        }
    }
    return { sorted, incident, evidence }
}

export function ReportFlowPage() {
    const navigate = useNavigate()
    const [screen, setScreen] = useState<Screen>('loading')
    const [form, setForm] = useState<Form | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const forms = await listForms()
                const target = forms.find((f) => f.targetValue === TARGET_VALUE) ?? forms[0]
                if (!target) throw new Error('No hay formularios disponibles')
                const full = await getForm(target.id)
                if (cancelled) return
                setForm(full)
                setScreen('form')
            } catch (e) {
                if (cancelled) return
                setError(e instanceof Error ? e.message : 'Error desconocido')
                setScreen('fatal')
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    if (screen === 'loading') {
        return (
            <div className="landing">
                <nav className="navbar">
                    <Logo />
                    <button className="nav-link" onClick={() => navigate('/landing')}>← Inicio</button>
                    <div></div>
                </nav>
                <div className="nav-stripe"></div>
                <div className="wrap">
                    <div className="card">
                        <p className="ss">Cargando formulario…</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (screen === 'fatal') {
        return (
            <div className="landing">
                <nav className="navbar">
                    <Logo />
                    <button className="nav-link" onClick={() => navigate('/landing')}>← Inicio</button>
                    <div></div>
                </nav>
                <div className="nav-stripe"></div>
                <div className="wrap">
                    <div className="card">
                        <div className="sh">No se pudo cargar el formulario</div>
                        <p className="ss">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (screen === 'success') {
        return <SuccessScreen message={successMessage} onHome={() => navigate('/landing')} />
    }

    return (
        <DynamicForm
            form={form!}
            onBack={() => navigate('/landing')}
            onSuccess={(message) => {
                setSuccessMessage(message)
                setScreen('success')
            }}
        />
    )
}

function DynamicForm({
    form,
    onBack,
    onSuccess,
}: {
    form: Form
    onBack: () => void
    onSuccess: (message: string) => void
}) {
    const { sorted, incident, evidence } = partitionQuestions(form)

    // pre-fill the age question with "18 o más" since this page targets adults
    const ageQuestion = sorted.find(isAgeQuestion)

    const [page, setPage] = useState(1)
    const [single, setSingle] = useState<Record<number, string>>({})
    const [multi, setMulti] = useState<Record<number, string[]>>({})
    const [urls, setUrls] = useState<Record<number, string>>({})
    const [files, setFiles] = useState<Record<number, File[]>>({})

    function valueFor(q: Question): string {
        if (q.responseType === 'MULTI_CHOICE') return (multi[q.id] ?? []).join(', ')
        if (q.responseType === 'FILE') return (files[q.id] ?? []).map((f) => f.name).join(', ')
        if (q.responseType === 'URL') return urls[q.id] ?? ''
        if (isAgeQuestion(q)) return '18 o más'
        return single[q.id] ?? ''
    }

    function buildAnswers(): Answer[] {
        const out: Answer[] = []
        for (const q of sorted) {
            const v = valueFor(q)
            if (v && v.trim().length > 0) out.push({ questionId: q.id, response: v })
        }
        return out
    }

    function allEvidenceFiles(): File[] {
        return Object.values(files).flat()
    }

    async function submit(): Promise<string> {
        const answers = buildAnswers()
        const draft = await createDraft(form.id, answers)
        for (const file of allEvidenceFiles()) {
            try {
                await fingerprintEvidence(draft.id, file)
            } catch (err) {
                console.warn('Fingerprint failed for', file.name, err)
            }
        }
        const result = await fileReport(draft.id)
        return result.message
    }

    // Step 1 must have at least one incident question answered
    const step1Ready =
        incident.length === 0 ||
        incident.some((q) =>
            q.responseType === 'MULTI_CHOICE' ? (multi[q.id]?.length ?? 0) > 0 : !!single[q.id],
        )

    return (
        <div className="landing">
            <nav className="navbar">
                <Logo />
                <button className="nav-link" onClick={onBack}>← Inicio</button>
                <div></div>
            </nav>
            <div className="nav-stripe"></div>
            <div className="wrap">
                <Stepper current={page} />
                <div className="ibox">
                    <p>
                        Reporte para <b>persona mayor de edad</b>
                        {ageQuestion ? <> · {ageQuestion.question} <b>18 o más</b></> : null}.
                    </p>
                </div>

                {page === 1 && (
                    <div className="card">
                        <div className="sh">Tipo de incidente</div>
                        <p className="ss">Selecciona las opciones que mejor representan lo que ocurrió.</p>
                        {incident.map((q) => (
                            <QuestionField
                                key={q.id}
                                question={q}
                                singleValue={single[q.id] ?? ''}
                                onSingleChange={(v) => setSingle({ ...single, [q.id]: v })}
                                multiValue={multi[q.id] ?? []}
                                onMultiToggle={(v) => {
                                    const cur = multi[q.id] ?? []
                                    setMulti({
                                        ...multi,
                                        [q.id]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
                                    })
                                }}
                            />
                        ))}
                        <div className="btn-row-r">
                            <button className="btn-main" onClick={() => setPage(2)} disabled={!step1Ready}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {page === 2 && (
                    <div className="card">
                        <div className="sh">
                            Información de contacto <span className="badge-opt">Opcional</span>
                        </div>
                        <p className="ss">
                            No estás obligado/a a proporcionarlos. Si deseas que las autoridades puedan contactarte,
                            llena los siguientes campos.
                        </p>
                        <ContactFields />
                        <div className="btn-row">
                            <button className="btn-out" onClick={() => setPage(1)}>← Anterior</button>
                            <button className="btn-main" onClick={() => setPage(3)}>Siguiente →</button>
                        </div>
                    </div>
                )}

                {page === 3 && (
                    <div className="card">
                        <div className="sh">URL y archivos de evidencia</div>
                        <p className="ss">Proporciona cualquier enlace o archivo que respalde tu reporte.</p>
                        {evidence.map((q) => (
                            <QuestionField
                                key={q.id}
                                question={q}
                                urlValue={urls[q.id] ?? ''}
                                onUrlChange={(v) => setUrls({ ...urls, [q.id]: v })}
                                filesValue={files[q.id] ?? []}
                                onFilesChange={(fs) => setFiles({ ...files, [q.id]: fs })}
                            />
                        ))}
                        <div className="btn-row">
                            <button className="btn-out" onClick={() => setPage(2)}>← Anterior</button>
                            <button className="btn-main" onClick={() => setPage(4)}>Revisar →</button>
                        </div>
                    </div>
                )}

                {page === 4 && <ConfirmCard onPrev={() => setPage(3)} submit={submit} onSuccess={onSuccess} />}
            </div>
            <Footer />
        </div>
    )
}

function QuestionField({
    question,
    singleValue,
    onSingleChange,
    multiValue,
    onMultiToggle,
    urlValue,
    onUrlChange,
    filesValue,
    onFilesChange,
}: {
    question: Question
    singleValue?: string
    onSingleChange?: (v: string) => void
    multiValue?: string[]
    onMultiToggle?: (v: string) => void
    urlValue?: string
    onUrlChange?: (v: string) => void
    filesValue?: File[]
    onFilesChange?: (f: File[]) => void
}) {
    const q = question

    if (q.responseType === 'SINGLE_CHOICE') {
        return (
            <div className="fg">
                <label>{q.question}</label>
                <div className="ropts">
                    {YES_NO.map((opt) => (
                        <label key={opt} className="ropt">
                            <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={singleValue === opt}
                                onChange={() => onSingleChange?.(opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
        )
    }

    if (q.responseType === 'MULTI_CHOICE') {
        return (
            <div className="fg">
                <label>{q.question}</label>
                <div className="cgrid">
                    {SOCIAL_NETWORKS.map((opt) => (
                        <label key={opt} className="copt">
                            <input
                                type="checkbox"
                                checked={multiValue?.includes(opt) ?? false}
                                onChange={() => onMultiToggle?.(opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
        )
    }

    if (q.responseType === 'URL') {
        return (
            <div className="fg">
                <label>{q.question}</label>
                <div className="url-row">
                    <input
                        type="url"
                        placeholder="https://..."
                        value={urlValue ?? ''}
                        onChange={(e) => onUrlChange?.(e.target.value)}
                    />
                </div>
            </div>
        )
    }

    if (q.responseType === 'FILE') {
        return (
            <div className="fg" style={{ marginTop: '0.75rem' }}>
                <label>{q.question}</label>
                <label className="upload-zone">
                    <div className="upload-icon">📎</div>
                    <p>
                        Arrastra archivos o haz clic
                        <br />
                        <span className="upload-hint">Capturas, imágenes, docs (máx. 10 MB)</span>
                    </p>
                    <input
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => onFilesChange?.(Array.from(e.target.files ?? []))}
                    />
                </label>
                {filesValue && filesValue.length > 0 && (
                    <p className="ss" style={{ marginTop: 6 }}>
                        {filesValue.length} archivo(s): {filesValue.map((f) => f.name).join(', ')}
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="fg">
            <label>{q.question}</label>
            <input
                type="text"
                value={singleValue ?? ''}
                onChange={(e) => onSingleChange?.(e.target.value)}
            />
        </div>
    )
}

function ContactFields() {
    return (
        <>
            <div className="fr">
                <div className="fg">
                    <label>Nombre</label>
                    <input type="text" placeholder="Tu nombre" />
                </div>
                <div className="fg">
                    <label>Teléfono de contacto</label>
                    <input type="tel" placeholder="(55) 0000-0000" />
                </div>
            </div>
            <div className="fg">
                <label>Correo electrónico</label>
                <input type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div className="fr">
                <div className="fg">
                    <label>Entidad federativa</label>
                    <select defaultValue="">
                        <option value="">Selecciona…</option>
                        <option>Ciudad de México</option>
                        <option>Jalisco</option>
                        <option>Nuevo León</option>
                        <option>Estado de México</option>
                        <option>Querétaro</option>
                        <option>Otro</option>
                    </select>
                </div>
                <div className="fg">
                    <label>Municipio</label>
                    <input type="text" placeholder="Tu municipio" />
                </div>
            </div>
        </>
    )
}

function ConfirmCard({
    onPrev,
    submit,
    onSuccess,
}: {
    onPrev: () => void
    submit: () => Promise<string>
    onSuccess: (message: string) => void
}) {
    const [accepted, setAccepted] = useState(false)
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit() {
        setError(null)
        setBusy('Guardando borrador…')
        try {
            const message = await submit()
            onSuccess(message)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido')
            setBusy(null)
        }
    }

    return (
        <div className="card">
            <div className="sh">Confirmar y enviar</div>
            <p className="ss">Revisa la información antes de enviar tu reporte.</p>
            <div className="cblk confirm-block">
                <p>
                    Tu reporte será enviado al{' '}
                    <b>Centro Nacional de Respuesta a Incidentes Cibernéticos de la Guardia Nacional</b> y a la{' '}
                    <b>Procuraduría Federal de Protección de NNA</b>.
                </p>
            </div>
            <label className="accept-row">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <span>Acepto que mi reporte sea procesado por las autoridades correspondientes.</span>
            </label>
            {error && (
                <p className="ss" style={{ color: '#b03030', marginTop: 8 }}>
                    No se pudo enviar el reporte: {error}
                </p>
            )}
            <div className="btn-row">
                <button className="btn-out" onClick={onPrev} disabled={!!busy}>← Anterior</button>
                <button className="btn-main" disabled={!accepted || !!busy} onClick={handleSubmit}>
                    {busy ?? 'Enviar reporte ✓'}
                </button>
            </div>
        </div>
    )
}

function SuccessScreen({ message, onHome }: { message: string | null; onHome: () => void }) {
    return (
        <div className="landing">
            <nav className="navbar">
                <Logo />
                <div></div>
                <div></div>
            </nav>
            <div className="nav-stripe"></div>
            <div className="wrap success-wrap">
                <div className="suc-card">
                    <div className="suc-ico">✓</div>
                    <h2>¡Reporte enviado con éxito!</h2>
                    <div className="msg">{message}</div>
                    <p className="msg-add">
                        Adicionalmente informaremos a los administradores de la red social en la que se difundió el
                        contenido reportado para que eliminen el contenido.
                    </p>
                    <div className="ent-row">
                        <div className="ent">
                            Centro Nacional de Respuesta a Incidentes Cibernéticos
                            <span>Guardia Nacional de México</span>
                        </div>
                        <div className="ent">
                            Procuraduría Federal de Protección
                            <span>Niñas, Niños y Adolescentes</span>
                        </div>
                    </div>
                    <button className="btn-main" onClick={onHome}>Volver al inicio</button>
                </div>
            </div>
            <Footer />
        </div>
    )
}
