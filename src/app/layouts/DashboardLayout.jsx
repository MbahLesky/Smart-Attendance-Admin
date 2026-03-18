import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Sidebar } from '../../components/shared/Sidebar'
import { Topbar } from '../../components/shared/Topbar'
import { useAppStore } from '../store/useAppStore'

export function DashboardLayout() {
  const location = useLocation()
  const currentUserId = useAppStore((state) => state.auth.currentUserId)

  if (!currentUserId) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />
  }

  return (
    <div className="page-shell flex min-h-screen gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Topbar />
        <Outlet />
      </main>
    </div>
  )
}
