import { Routes, Route, Navigate } from 'react-router-dom'
import { Typography } from '@mui/material'
import LoginPage from './features/auth/pages/LoginPage'
import DashboardPlaceholder from './features/dashboard/DashboardPlaceholder'
import ProtectedRoute from './shared/components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
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
                <Route
                    element={
                        <MainLayout
                            mode={mode}
                            setMode={setMode}
                        />
                    }
                >
                    <Route
                        path="/dashboard"
                        element={<DashboardPlaceholder />}
                    />
                </Route>
            </Route>

            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

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