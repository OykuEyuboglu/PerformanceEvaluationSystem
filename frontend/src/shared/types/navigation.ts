import type { UserRole } from '../../features/users/types'

export interface NavItem {
    path: string
    label: string
    icon: string
    roles: UserRole[]
}

export const navItems: NavItem[] = [
    {
        path: '/dashboard',
        label: 'dashboard',
        icon: 'Dashboard',
        roles: [
            'Admin',
            'Evaluator',
            'Employee',
        ],
    },

    {
        path: '/users',
        label: 'users',
        icon: 'People',
        roles: ['Admin'],
    },

    {
        path: '/criteria',
        label: 'criteria',
        icon: 'Rule',
        roles: ['Admin'],
    },

    {
        path: '/evaluation-periods',
        label: 'evaluationPeriods',
        icon: 'CalendarMonth',
        roles: ['Admin'],
    },

    {
        path: '/evaluator-employees',
        label: 'evaluatorEmployees',
        icon: 'Groups',
        roles: ['Admin'],
    },

    {
        path: '/evaluations',
        label: 'evaluations',
        icon: 'Assignment',
        roles: ['Admin'],
    },

    {
        path: '/evaluations/new',
        label: 'newEvaluation',
        icon: 'RateReview',
        roles: ['Evaluator'],
    },

    {
        path: '/my-evaluations',
        label: 'myEvaluations',
        icon: 'Assignment',
        roles: ['Employee'],
    },

    {
        path: '/reports/team-ranking',
        label: 'teamRanking',
        icon: 'Leaderboard',
        roles: ['Evaluator'],
    },

]