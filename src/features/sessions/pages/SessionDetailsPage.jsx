import { useMemo } from 'react'
import { CalendarClock, ClipboardList, QrCode } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useAttendanceMatrix } from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatDateLabel,
  formatName,
  formatTimeLabel,
  formatWindow,
  getDepartmentById,
  getOrganizationById,
  getSessionById,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { EmptyState } from '../../../components/ui/empty-state'

export function SessionDetailsPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const openSessionQr = useAppStore((state) => state.openSessionQr)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment)
  const setSelectedSession = useAppStore((state) => state.setSelectedSession)
  const session = useAppStore((state) => getSessionById(state, sessionId))
  const organization = useAppStore((state) =>
    session ? getOrganizationById(state, session.organizationId) : null,
  )
  const department = useAppStore((state) =>
    session?.departmentId ? getDepartmentById(state, session.departmentId) : null,
  )
  const attendanceMatrix = useAttendanceMatrix(session?.id)

  const attendanceSummary = useMemo(() => {
    const present = attendanceMatrix.filter((entry) => entry.record?.status === 'present').length
    const late = attendanceMatrix.filter((entry) => entry.record?.status === 'late').length
    const pending = attendanceMatrix.filter((entry) => !entry.record).length

    return {
      present,
      late,
      pending,
    }
  }, [attendanceMatrix])

  if (!session) {
    return (
      <EmptyState
        title="Session not found"
        description="This session is not available. Please go back and choose another one"
        actionLabel="Back to sessions"
        onAction={() => navigate('/app/sessions')}
      />
    )
  }

  function syncContext() {
    setSelectedOrganization(session.organizationId)
    setSelectedDepartment(session.departmentId ?? null)
    setSelectedSession(session.id)
  }

  function handleOpenQr() {
    const result = openSessionQr(session.id)

    if (!result.success) {
      toast.error(result.message)
      return
    }

    syncContext()
    navigate(`/app/sessions/${session.id}/qr`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Session details"
        title={session.title}
        description="Check session information before starting attendance"
        secondaryAction={
          <Link to="/app/sessions">
            <Button variant="secondary">Back to sessions</Button>
          </Link>
        }
        actionLabel={session.status === 'draft' ? 'Generate QR' : 'Open QR'}
        onAction={handleOpenQr}
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-slate-950 text-white">
          <p className="text-caption text-slate-400">Selected session</p>
          <h2 className="mt-2 text-2xl font-semibold">{session.title}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Organization</p>
              <p className="mt-2 font-semibold">{organization?.name ?? 'Unknown'}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Department</p>
              <p className="mt-2 font-semibold">{department?.name ?? 'Unassigned'}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Date</p>
              <p className="mt-2 font-semibold">{formatDateLabel(session.sessionDate)}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Time window</p>
              <p className="mt-2 font-semibold">{formatWindow(session)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge>{session.status}</Badge>
            <Badge tone="info">{session.attendanceMethod}</Badge>
            <Badge tone={session.locationRequired ? 'warning' : 'neutral'}>
              {session.locationRequired ? 'Location required' : 'Location optional'}
            </Badge>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <CalendarClock className="size-5 text-brand-primary" />
                <p className="mt-3 text-2xl font-semibold text-brand-text">{attendanceMatrix.length}</p>
                <p className="mt-1 text-sm text-brand-muted">Participants</p>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <ClipboardList className="size-5 text-brand-primary" />
                <p className="mt-3 text-2xl font-semibold text-brand-text">{attendanceSummary.present + attendanceSummary.late}</p>
                <p className="mt-1 text-sm text-brand-muted">Recorded check-ins</p>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <QrCode className="size-5 text-brand-primary" />
                <p className="mt-3 text-2xl font-semibold text-brand-text">{session.graceMinutes}</p>
                <p className="mt-1 text-sm text-brand-muted">Grace minutes</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption">Participant roster</p>
                <h2 className="mt-2 text-xl font-semibold text-brand-text">Review before QR and attendance actions</h2>
              </div>
              <Link to="/app/attendance">
                <Button
                  variant="secondary"
                  onClick={() => {
                    syncContext()
                  }}
                >
                  Open attendance view
                </Button>
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {attendanceMatrix.map((entry) => (
                <div key={entry.participant.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-brand-text">{formatName(entry.participant)}</p>
                      <p className="mt-1 text-sm text-brand-muted">{entry.participant.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{entry.record?.status ?? (session.status === 'closed' ? 'absent' : 'pending')}</Badge>
                      <span className="text-sm text-brand-muted">
                        {entry.record ? formatTimeLabel(new Date(entry.record.checkInTime).toTimeString().slice(0, 5)) : 'Awaiting'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
