import { Navigate, Outlet } from 'react-router-dom'

import { AppLogo } from '../../components/shared/AppLogo'
import { useAppStore } from '../store/useAppStore'

export function AuthLayout() {
  const currentUserId = useAppStore((state) => state.auth.currentUserId)

  if (currentUserId) {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.14),transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)]">
      <div className="page-shell flex min-h-screen items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="panel relative hidden overflow-hidden p-10 lg:block">
            <div className="absolute inset-0 bg-grid bg-size-[24px_24px] opacity-60" />
            <div className="relative flex h-full flex-col justify-between">
              <AppLogo />
              <div className="max-w-xl">
                <p className="text-caption">Smart Attendance</p>
                <h1 className="mt-4 text-headline">
                  Manage attendance easily across your organization. Create departments, add users, set up sessions, and track attendance in real time. Simply sign in, choose your organization, and control everything from one dashboard.
                </h1>
                <p className="mt-1 text-body text-slate-300">
                  Sign in to manage your organization, handle departments, and monitor upcoming attendance sessions.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['3', 'Organizations'],
                  ['5', 'Core admin flows'],
                  ['100%', 'Secure access'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border bg-white/80 p-4 backdrop-blur">
                    <p className="text-2xl font-semibold text-brand-text">{value}</p>
                    <p className="mt-2 text-sm text-brand-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="panel mx-auto flex w-full max-w-xl items-center justify-center p-6 sm:p-10">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  )
}
