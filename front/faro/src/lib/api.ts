export type ResponseType = 'TEXT' | 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'URL' | 'FILE'

export type Question = {
    id: number
    question: string
    orderIndex: number
    responseType: ResponseType
    openEnded: boolean
}

export type Form = {
    id: number
    description: string
    targetType: string
    targetValue: string
    questions: Question[]
}

export type Answer = { questionId: number; response: string }

export type FileReportResult = {
    report: { id: number }
    message: string
}

async function asJson<T>(r: globalThis.Response): Promise<T> {
    if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(`HTTP ${r.status}${text ? `: ${text}` : ''}`)
    }
    return r.json() as Promise<T>
}

export async function listForms(): Promise<Form[]> {
    return asJson(await fetch('/api/forms'))
}

export async function getForm(id: number): Promise<Form> {
    return asJson(await fetch(`/api/forms/${id}`))
}

export async function createForm(input: {
    description: string
    targetType: string
    targetValue: string
    questions: { question: string; responseType: ResponseType; openEnded: boolean }[]
}): Promise<Form> {
    return asJson(
        await fetch('/api/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }),
    )
}

export async function updateForm(id: number, input: {
    description: string
    targetType: string
    targetValue: string
}): Promise<Form> {
    return asJson(
        await fetch(`/api/forms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }),
    )
}

export async function deleteForm(id: number): Promise<void> {
    const r = await fetch(`/api/forms/${id}`, { method: 'DELETE' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
}

export async function addQuestion(formId: number, input: {
    question: string
    responseType: ResponseType
    openEnded: boolean
}): Promise<Question> {
    return asJson(
        await fetch(`/api/forms/${formId}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }),
    )
}

export async function deleteQuestion(formId: number, questionId: number): Promise<void> {
    const r = await fetch(`/api/forms/${formId}/questions/${questionId}`, { method: 'DELETE' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
}

export async function createDraft(
    formId: number,
    answers: Answer[],
    profileId?: string,
): Promise<{ id: number }> {
    return asJson(
        await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formId, answers, profileId }),
        }),
    )
}

export type ProfileStats = { profileId: string; validatedReports: number }

export async function getProfileStats(profileId: string): Promise<ProfileStats> {
    return asJson(await fetch(`/api/profile/${encodeURIComponent(profileId)}/stats`))
}

export async function fingerprintEvidence(reportId: number, file: File): Promise<unknown> {
    return asJson(
        await fetch(`/api/reports/${reportId}/evidence/fingerprint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Filename': file.name,
            },
            body: file,
        }),
    )
}

export type Authority = {
    id: number
    name: string
    email: string
    enabled: boolean
}

export async function listAllAuthorities(): Promise<Authority[]> {
    return asJson(await fetch('/api/authorities'))
}

export async function createAuthority(input: { name: string; email: string; enabled: boolean }): Promise<Authority> {
    return asJson(
        await fetch('/api/authorities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }),
    )
}

export async function updateAuthority(id: number, input: { name: string; email: string; enabled: boolean }): Promise<Authority> {
    return asJson(
        await fetch(`/api/authorities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        }),
    )
}

export async function deleteAuthority(id: number): Promise<void> {
    const r = await fetch(`/api/authorities/${id}`, { method: 'DELETE' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
}

export type Stats = {
    totalReports: number
    filedReports: number
    draftReports: number
    totalEvidence: number
    dangerousEvidence: number
}

export async function getStats(): Promise<Stats> {
    return asJson(await fetch('/api/stats'))
}

export type LoginResult = { token: string; username: string; role: string }

export async function login(username: string, password: string): Promise<LoginResult> {
    return asJson(
        await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        }),
    )
}

export type DangerLevel = 'DANGER' | 'WARNING' | 'GRAY'

export type ReportSummary = {
    id: number
    filed: string | null
    created: string
    status: string
    dangerLevel: DangerLevel
    evidenceCount: number
    dangerousEvidenceCount: number
    reviewed: boolean
    evidenceConfirmed: boolean
    addressed: boolean
}

export async function listReportSummaries(): Promise<ReportSummary[]> {
    return asJson(await fetch('/api/reports/summary'))
}

export type ReportAnswerDetail = {
    questionId: number
    questionText: string
    responseType: ResponseType
    orderIndex: number
    response: string
}

export type ReportEvidenceDetail = {
    id: number
    filename: string
    dangerous: boolean
    createdAt: string
}

export type ReportDetail = {
    id: number
    status: string
    created: string
    filed: string | null
    profileId: string | null
    dangerLevel: DangerLevel
    reviewed: boolean
    evidenceConfirmed: boolean
    addressed: boolean
    answers: ReportAnswerDetail[]
    evidence: ReportEvidenceDetail[]
}

export async function getReportDetail(id: number): Promise<ReportDetail> {
    return asJson(await fetch(`/api/reports/${id}/detail`))
}

export async function reviewReport(id: number): Promise<unknown> {
    return asJson(
        await fetch(`/api/reports/${id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        }),
    )
}

export async function confirmReportEvidence(id: number): Promise<unknown> {
    return asJson(
        await fetch(`/api/reports/${id}/confirm-evidence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        }),
    )
}

export async function markReportAddressed(id: number): Promise<unknown> {
    return asJson(
        await fetch(`/api/reports/${id}/addressed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        }),
    )
}

export async function fileReport(reportId: number): Promise<FileReportResult> {
    return asJson(
        await fetch(`/api/reports/${reportId}/file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        }),
    )
}

/** Maps an ordered list of textual answers to the form's questions by orderIndex. */
export function buildAnswersByOrder(form: Form, answers: string[]): Answer[] {
    const sorted = [...form.questions].sort((a, b) => a.orderIndex - b.orderIndex)
    const out: Answer[] = []
    for (let i = 0; i < Math.min(sorted.length, answers.length); i++) {
        const value = answers[i]
        if (value && value.trim().length > 0) {
            out.push({ questionId: sorted[i].id, response: value })
        }
    }
    return out
}
