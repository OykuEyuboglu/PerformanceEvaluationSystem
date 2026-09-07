import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../types/user'
import { jwtDecode } from 'jwt-decode'

interface ProtectedRouteProps {
    allowedRoles?: UserRole[]
}

interface JwtPayload {
    exp?: number
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, token, expireSession } = useAuthStore()

    useEffect(() => {
        if (!isAuthenticated || !token) return

        try {
            const decoded = jwtDecode<JwtPayload>(token)

            if (!decoded.exp) return

            const expirationTime = decoded.exp * 1000
            const remainingTime = expirationTime - Date.now()

            if (remainingTime <= 0) {
                expireSession()
                return
            }

            const timer = setTimeout(() => {
                expireSession()
            }, remainingTime)

            return () => clearTimeout(timer)
        } catch {
            expireSession()
        }
    }, [isAuthenticated, token, expireSession])

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />
    }

    try {
        const decoded = jwtDecode<JwtPayload>(token)

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            expireSession()
            return <Navigate to="/login" replace />
        }
    } catch {
        expireSession()
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}