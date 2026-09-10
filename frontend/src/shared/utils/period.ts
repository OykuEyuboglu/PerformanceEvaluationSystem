import type { EvaluationPeriod } from '../../features/evaluationPeriods/types'

export function getDefaultPeriod(periods: EvaluationPeriod[]): EvaluationPeriod | undefined {
    if (periods.length === 0) return undefined

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const normalize = (d: string) => {
        const date = new Date(d)
        date.setHours(0, 0, 0, 0)
        return date
    }

    const active = periods.find((p) => normalize(p.startDate) <= today && today <= normalize(p.endDate))
    if (active) return active

    const past = periods
        .filter((p) => normalize(p.endDate) < today)
        .sort((a, b) => normalize(b.endDate).getTime() - normalize(a.endDate).getTime())
    if (past.length > 0) return past[0]

    const upcoming = [...periods].sort(
        (a, b) => normalize(a.startDate).getTime() - normalize(b.startDate).getTime()
    )
    return upcoming[0]
}