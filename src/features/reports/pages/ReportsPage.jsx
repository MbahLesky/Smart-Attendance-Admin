import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

import {
  useAccessibleOrganizations,
  useScopedAttendanceMatrices,
  useScopedDepartments,
  useScopedSessions,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatDateLabel,
  formatWindow,
  getSessionById,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { ScopeFilters } from '../../../components/shared/ScopeFilters'
import { StatCard } from '../../../components/shared/StatCard'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

function buildSummary(matrix) {
  const present = matrix.filter((entry) => entry.record?.status === 'present').length
  const late = matrix.filter((entry) => entry.record?.status === 'late').length
  const absent = matrix.filter((entry) => entry.record?.status === 'absent').length
  const pending = matrix.filter((entry) => !entry.record).length
  const total = matrix.length

  return {
    total,
    present,
    late,
    absent,
    pending,
    rate: total ? Math.round(((present + late) / total) * 100) : 0,
  }
}

export function ReportsPage() {
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const selectedDepartmentId = useAppStore((state) => state.ui.selectedDepartmentId)
  const selectedSessionId = useAppStore((state) => state.ui.selectedSessionId)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment)
  const setSelectedSession = useAppStore((state) => state.setSelectedSession)
  const organizations = useAccessibleOrganizations()
  const departments = useScopedDepartments(selectedOrganizationId)
  const sessions = useScopedSessions({
    organizationId: selectedOrganizationId,
    departmentId: selectedDepartmentId,
  })
  const selectedSession = useAppStore((state) => getSessionById(state, selectedSessionId))
  const scopedMatrices = useScopedAttendanceMatrices({
    organizationId: selectedOrganizationId,
    departmentId: selectedDepartmentId,
  })

  const aggregate = useMemo(() => {
    const flattened = scopedMatrices.flatMap((entry) => entry.matrix)
    return buildSummary(flattened)
  }, [scopedMatrices])

  const selectedSessionSummary = useMemo(
    () => (selectedSession ? buildSummary(scopedMatrices.find((entry) => entry.session.id === selectedSession.id)?.matrix ?? []) : null),
    [scopedMatrices, selectedSession],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Generate reports"
        description="Reporting comes after the core management flows. Change the scope to review organization-wide summaries or narrow all the way down to a single session before exporting."
        secondaryAction={
          <Button variant="secondary" onClick={() => toast.success('CSV export simulated from the current report scope.')}>
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <Card>
        <ScopeFilters
          organizations={organizations}
          departments={departments}
          sessions={sessions}
          selectedOrganizationId={selectedOrganizationId}
          selectedDepartmentId={selectedDepartmentId}
          selectedSessionId={selectedSessionId}
          onOrganizationChange={setSelectedOrganization}
          onDepartmentChange={setSelectedDepartment}
          onSessionChange={setSelectedSession}
          showSession
          organizationDisabled={organizations.length === 1}
          departmentDisabled={!selectedOrganizationId}
          sessionDisabled={!selectedDepartmentId}
        />
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Participants in scope" value={aggregate.total} detail="Across the current reporting scope." badge="Scope" tone="info" />
        <StatCard label="Present" value={aggregate.present} detail="Recorded within grace period." badge="Status" tone="success" />
        <StatCard label="Late" value={aggregate.late} detail="Recorded after grace period." badge="Status" tone="warning" />
        <StatCard label="Attendance rate" value={`${aggregate.rate}%`} detail={`${aggregate.pending} pending or absent.`} badge="Derived" tone="info" />
      </section>

      {selectedSession && selectedSessionSummary ? (
        <Card>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-caption">Selected session report</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-text">{selectedSession.title}</h2>
              <p className="mt-2 text-sm text-brand-muted">
                {formatDateLabel(selectedSession.sessionDate)} / {formatWindow(selectedSession)}
              </p>
            </div>
            <Badge>{selectedSession.status}</Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-sm text-brand-muted">Participants</p>
              <p className="mt-2 text-2xl font-semibold text-brand-text">{selectedSessionSummary.total}</p>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-sm text-brand-muted">Present</p>
              <p className="mt-2 text-2xl font-semibold text-brand-text">{selectedSessionSummary.present}</p>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-sm text-brand-muted">Late</p>
              <p className="mt-2 text-2xl font-semibold text-brand-text">{selectedSessionSummary.late}</p>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-sm text-brand-muted">Rate</p>
              <p className="mt-2 text-2xl font-semibold text-brand-text">{selectedSessionSummary.rate}%</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption">Session summaries</p>
            <h2 className="mt-2 text-xl font-semibold text-brand-text">Breakdown for the current scope</h2>
          </div>
          <Badge tone="info">{sessions.length} sessions</Badge>
        </div>
        <div className="mt-6 space-y-3">
          {scopedMatrices.map(({ session, matrix }) => {
            const summary = buildSummary(matrix)

            return (
              <div key={session.id} className="rounded-3xl border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-brand-text">{session.title}</p>
                      <Badge>{session.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-brand-muted">
                      {formatDateLabel(session.sessionDate)} / {formatWindow(session)}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm text-brand-muted">
                    <div>
                      <p className="font-semibold text-brand-text">{summary.total}</p>
                      <p>Participants</p>
                    </div>
                    <div>
                      <p className="font-semibold text-brand-text">{summary.rate}%</p>
                      <p>Attendance rate</p>
                    </div>
                    <div>
                      <p className="font-semibold text-brand-text">{summary.late}</p>
                      <p>Late</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
