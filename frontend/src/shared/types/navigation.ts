import type { UserRole } from './user'

export interface NavItem {
    label: string
    path: string
    icon: string // MUI icon adı, Sidebar'da eşleyeceğiz
    roles: UserRole[]
}

export const navItems: NavItem[] = [
    { label: 'Panel', path: '/dashboard', icon: 'Dashboard', roles: ['Admin', 'Evaluator', 'Employee'] },
    { label: 'Kullanıcı Yönetimi', path: '/users', icon: 'People', roles: ['Admin'] },
    { label: 'Kriter Yönetimi', path: '/criteria', icon: 'Rule', roles: ['Admin'] },
    { label: 'Değerlendirme Dönemleri', path: '/evaluation-periods', icon: 'CalendarMonth', roles: ['Admin'] },
    { label: 'Ekip Atamaları', path: '/evaluator-employees', icon: 'Groups', roles: ['Admin'] },
    { label: 'Değerlendirmeler', path: '/evaluations', icon: 'Assignment', roles: ['Admin'] },
    { label: 'Ekibimi Değerlendir', path: '/evaluations/new', icon: 'RateReview', roles: ['Evaluator'] },
    { label: 'Ekip Sıralaması', path: '/reports/team-ranking', icon: 'Leaderboard', roles: ['Evaluator'] },
    { label: 'Departman Sıralaması', path: '/reports/department-ranking', icon: 'BarChart', roles: ['Admin'] },
    { label: 'Performansım', path: '/my-evaluations', icon: 'TrendingUp', roles: ['Employee'] },
]