import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppLogo } from '../../../components/shared/AppLogo'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { dashboardStats, sessions } from '../../../lib/mock-data'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)]">
      <div className="page-shell py-8">
        <header className="flex items-center justify-between gap-4">
          <AppLogo />
          <div className="flex items-center gap-3">
            <Link to="/sign-in" className="text-sm font-medium text-brand-muted">
              Sign in
            </Link>
            <Link to="/register">
              <Button>Request access</Button>
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge tone="info">Admin panel</Badge>
            <h1 className="mt-6 text-display max-w-3xl">
              Manage attendance easily in one simple dashboard
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-brand-muted">
              Handle schools, departments, students, sessions, QR check-ins, and reports in one simple dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sign-in">
                <Button size="lg">
                  Open admin workspace
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="secondary">
                  Create organization
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Real-time monitoring', 'Track check-ins and attendance status in real time.'],
                ['Session QR display', 'Show QR codes for quick check-in'],
                ['Simple reports', 'View and download attendance summaries'],
              ].map(([title, description]) => (
                <Card key={title} className="p-5">
                  <p className="text-sm font-semibold text-brand-text">{title}</p>
                  <p className="mt-2 text-sm text-brand-muted">{description}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden bg-slate-950 p-0 text-white">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live dashboard preview</p>
                  <h2 className="mt-2 text-2xl font-semibold">Today’s attendance pulse</h2>
                </div>
                <Sparkles className="size-5 text-cyan-300" />
              </div>
            </div>
            <div className="grid gap-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {dashboardStats.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                    <p className="mt-2 text-sm text-cyan-300">{item.change}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Active sessions</h3>
                  <Badge tone="success">Live</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-slate-400">{session.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{session.window}</p>
                        <p className="text-xs text-slate-400">{session.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'Secure role-aware design',
              description: 'Different roles for super admin and organization admin',
            },
            {
              icon: CheckCircle2,
              title: 'Works in any situation',
              description: 'Handles loading, empty data, errors, and confirmations',
            },
            {
              icon: Sparkles,
              title: 'Ready for future updates',
              description: 'Easy to connect with backend and offline support',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title}>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Icon className="size-5 text-brand-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-brand-text">{item.title}</h3>
                <p className="mt-3 text-sm text-brand-muted">{item.description}</p>
              </Card>
            )
          })}
        </section>
      </div>
    </div>
  )
}
