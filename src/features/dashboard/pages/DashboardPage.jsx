import { Building2, CalendarClock, ClipboardList, MoveRight, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useDashboardMetrics,
  useScopedSessions,
  useUnreadNotifications,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatDateLabel,
  formatWindow,
  getOrganizationById,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { StatCard } from '../../../components/shared/StatCard'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

const flowSteps = [
  {
    title: 'Select organization',
    description: 'Choose the organization you want to manage',
    to: '/app/organizations',
    icon: Building2,
  },
  {
    title: 'Create departments',
    description: 'Add departments to your organization',
    to: '/app/departments',
    icon: Building2,
  },
  {
    title: 'Add users',
    description: 'Add students and staff to your organization',
    to: '/app/users',
    icon: Users2,
  },
  {
    title: 'Create sessions',
    description: 'Create sessions for classes or events',
    to: '/app/sessions',
    icon: CalendarClock,
  },
  {
    title: 'Monitor attendance',
    description: 'Track attendance and make manual corrections',
    to: '/app/attendance',
    icon: ClipboardList,
  },
]

export function DashboardPage() {
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const departments = useAppStore((state) => state.departments)
  const metrics = useDashboardMetrics(selectedOrganizationId)
  const sessions = useScopedSessions({ organizationId: selectedOrganizationId })
  const notifications = useUnreadNotifications()
  const selectedOrganization = useAppStore((state) =>
    getOrganizationById(state, selectedOrganizationId),
  )
  const recentSessions = [...sessions]
    .sort((left, right) => `${left.sessionDate}${left.startTime}`.localeCompare(`${right.sessionDate}${right.startTime}`))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Follow these steps to manage attendance"
        description={`The current workspace is ${selectedOrganization?.name ?? 'all accessible organizations'}. Keep the organization -> department -> user -> session -> attendance order so downstream actions stay context-aware.`}
        secondaryAction={
          <Link to="/app/sessions">
            <Button variant="secondary">Manage sessions</Button>
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Organizations in scope"
          value={metrics.organizationCount}
          detail="Super admins can switch scope from the top bar."
          badge={selectedOrganization ? 'Scoped' : 'Global'}
          tone="info"
        />
        <StatCard
          label="Attendees"
          value={metrics.attendeeCount}
          detail="Only attendees assigned to the selected scope are counted."
          badge="Users"
          tone="success"
        />
        <StatCard
          label="Sessions"
          value={metrics.sessionCount}
          detail={`${metrics.activeSessionCount} currently active or ready to monitor.`}
          badge="Flow"
          tone="info"
        />
        <StatCard
          label="Attendance rate"
          value={`${metrics.attendanceRate}%`}
          detail={`${metrics.lateCount} late records in the current dataset.`}
          badge="Derived"
          tone="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Required flow order</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-text">What the docs expect admins to do next</h2>
            </div>
            <Badge tone="info">Source of truth</Badge>
          </div>
          <div className="mt-6 grid gap-3">
            {flowSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <Link
                  key={step.title}
                  to={step.to}
                  className="rounded-3xl border bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-soft">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-text">
                          {index + 1}. {step.title}
                        </p>
                        <p className="mt-2 text-sm text-brand-muted">{step.description}</p>
                      </div>
                    </div>
                    <MoveRight className="mt-1 size-4 shrink-0 text-brand-primary" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="bg-slate-950 text-white">
          <p className="text-caption text-slate-400">Current workspace</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {selectedOrganization?.name ?? 'All organizations'}
          </h2>
          <p className="mt-4 text-sm text-slate-300">
            Use the top-bar selector before building departments, user rosters, or sessions so the flow stays consistent with the documentation.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Active sessions</p>
              <p className="mt-3 text-3xl font-semibold">{metrics.activeSessionCount}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Unread notifications</p>
              <p className="mt-3 text-3xl font-semibold">{notifications.length}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Sessions</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-text">Next sessions in the selected scope</h2>
            </div>
            <Link to="/app/sessions">
              <Button variant="secondary" size="sm">
                Open session management
              </Button>
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {recentSessions.map((session) => {
              const department = departments.find((item) => item.id === session.departmentId)

              return (
                <div key={session.id} className="rounded-3xl border bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-brand-text">{session.title}</p>
                        <Badge>{session.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-brand-muted">
                        {department?.name ?? 'No department'} / {formatDateLabel(session.sessionDate)}
                      </p>
                    </div>
                    <div className="text-sm text-brand-muted">
                      <p>{formatWindow(session)}</p>
                      <p className="mt-1">Grace: {session.graceMinutes} minutes</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Notifications</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-text">Outstanding follow-ups</h2>
            </div>
            <Badge tone="warning">{notifications.length} unread</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-3xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-brand-text">{notification.title}</p>
                  <Badge tone={notification.tone}>{formatDateLabel(notification.createdAt)}</Badge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{notification.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
