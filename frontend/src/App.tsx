import { Routes, Route, Navigate } from 'react-router-dom'
import { Typography } from '@mui/material'
import LoginPage from './features/auth/pages/LoginPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import ProtectedRoute from './shared/components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

import UsersPage from './features/users/pages/UsersPage'
import CriteriaPage from './features/criteria/pages/CriteriaPage'
import EvaluationPeriodsPage from './features/evaluationPeriods/pages/EvaluationPeriodsPage'
import EvaluatorEmployeesPage from './features/evaluatorEmployees/pages/EvaluatorEmployeesPage'
import EvaluationsPage from './features/evaluations/pages/EvaluationsPage'
import NewEvaluationPage from './features/evaluations/pages/NewEvaluationPage'
import TeamRankingPage from './features/reports/pages/TeamRankingPage'
import DepartmentRankingPage from './features/reports/pages/DepartmentRankingPage'
import MyEvaluationsPage from './features/evaluations/pages/MyEvaluationsPage'

import './App.css'

type AppProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

export default function App({ mode, setMode }: AppProps) {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout mode={mode} setMode={setMode} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/criteria" element={<CriteriaPage />} />
                        <Route path="/evaluation-periods" element={<EvaluationPeriodsPage />} />
                        <Route path="/evaluator-employees" element={<EvaluatorEmployeesPage />} />
                        <Route path="/evaluations" element={<EvaluationsPage />} />
                        <Route path="/reports/department-ranking" element={<DepartmentRankingPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['Evaluator']} />}>
                        <Route path="/evaluations/new" element={<NewEvaluationPage />} />
                        <Route path="/reports/team-ranking" element={<TeamRankingPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
                        <Route path="/my-evaluations" element={<MyEvaluationsPage />} />
                    </Route>
                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/unauthorized" element={<Typography sx={{ p: 4 }}>Yetkiniz yok</Typography>} />
        </Routes>
    )
}