import { Typography } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'

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
import MyEvaluationsPage from './features/evaluations/pages/MyEvaluationsPage'

import { LanguageProvider } from './shared/i18n/LanguageContext'

import './App.css'

type AppProps = {
    mode: 'light' | 'dark'
    setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>
}

function AppContent({
    mode,
    setMode,
}: AppProps) {
    return (
        <Routes>
            {/* Login */}
            <Route
                path="/login"
                element={<LoginPage />}
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route
                    element={
                        <MainLayout
                            mode={mode}
                            setMode={setMode}
                        />
                    }
                >
                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />

                    {/* Admin */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={['Admin']}
                            />
                        }
                    >
                        <Route
                            path="/users"
                            element={<UsersPage />}
                        />

                        <Route
                            path="/criteria"
                            element={<CriteriaPage />}
                        />

                        <Route
                            path="/evaluation-periods"
                            element={
                                <EvaluationPeriodsPage />
                            }
                        />

                        <Route
                            path="/evaluator-employees"
                            element={
                                <EvaluatorEmployeesPage />
                            }
                        />

                        <Route
                            path="/evaluations"
                            element={<EvaluationsPage />}
                        />
                    </Route>

                    {/* Evaluator */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={['Evaluator']}
                            />
                        }
                    >
                        <Route
                            path="/evaluations/new"
                            element={
                                <NewEvaluationPage />
                            }
                        />

                        <Route
                            path="/reports/team-ranking"
                            element={
                                <TeamRankingPage />
                            }
                        />
                    </Route>

                    {/* Employee */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={['Employee']}
                            />
                        }
                    >
                        <Route
                            path="/my-evaluations"
                            element={
                                <MyEvaluationsPage />
                            }
                        />
                    </Route>
                </Route>
            </Route>

            {/* Default */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            {/* Unauthorized */}
            <Route
                path="/unauthorized"
                element={
                    <Typography sx={{ p: 4 }}>
                        Yetkiniz yok
                    </Typography>
                }
            />
        </Routes>
    )
}

export default function App({
    mode,
    setMode,
}: AppProps) {
    return (
        <LanguageProvider>
            <AppContent
                mode={mode}
                setMode={setMode}
            />
        </LanguageProvider>
    )
}