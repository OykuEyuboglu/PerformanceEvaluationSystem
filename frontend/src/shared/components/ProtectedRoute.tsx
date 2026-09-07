import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../types/user'

interface ProtectedRouteProps {
    allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated) return <Navigate to="/login" replace />

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}