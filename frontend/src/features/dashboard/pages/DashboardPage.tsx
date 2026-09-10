import { useAuthStore } from '../../../store/authStore'
import AdminDashboardView from '../components/AdminDashboardView'
import EvaluatorDashboardView from '../components/EvaluatorDashboardView'
import EmployeeDashboardView from '../components/EmployeeDashboardView'

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user)

    if (user?.role === 'Admin') return <AdminDashboardView />
    if (user?.role === 'Evaluator') return <EvaluatorDashboardView firstName={user.firstName} />
    if (user?.role === 'Employee') return <EmployeeDashboardView firstName={user.firstName} />

    return null
}