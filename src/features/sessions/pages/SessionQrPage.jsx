import { ArrowLeft, Expand, TimerReset } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useAttendanceForSession,
  useParticipantsForSession,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatDateLabel,
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

export function SessionQrPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const openSessionQr = useAppStore((state) => state.openSessionQr)
  const session = useAppStore((state) => getSessionById(state, sessionId))
  const organization = useAppStore((state) =>
    session ? getOrganizationById(state, session.organizationId) : null,
  )
  const department = useAppStore((state) =>
    session?.departmentId ? getDepartmentById(state, session.departmentId) : null,
  )
  const participants = useParticipantsForSession(session?.id)
  const attendance = useAttendanceForSession(session?.id)

  if (!session) {
    return (
      <EmptyState
        title="QR context is missing"
        description="Please open QR from a session"
        actionLabel="Back to sessions"
        onAction={() => navigate('/app/sessions')}
      />
    )
  }

  function activateQr() {
    const result = openSessionQr(session.id)

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success('QR flow is active for the selected session.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Session QR"
        title={`${session.title} QR display`}
        description="Show this QR code for students to scan"
        secondaryAction={
          <Link to={`/app/sessions/${session.id}`}>
            <Button variant="secondary">
              <ArrowLeft className="size-4" />
              Back to details
            </Button>
          </Link>
        }
        actionLabel={session.status === 'draft' ? 'Generate QR now' : 'Refresh QR state'}
        onAction={activateQr}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="bg-slate-950 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-caption text-slate-400">Current session</p>
              <h2 className="mt-2 text-2xl font-semibold">{session.title}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {organization?.name} / {department?.name ?? 'Unassigned department'}
              </p>
            </div>
            <Badge tone={session.status === 'draft' ? 'warning' : 'success'}>
              {session.status === 'draft' ? 'Draft session' : 'Accepting check-ins'}
            </Badge>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <QRCode size={240} value={session.qrToken} />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-300">Code</p>
            <p className="mt-2 font-mono text-lg tracking-[0.2em] text-cyan-300">{session.qrToken}</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-brand-text">Session summary</h2>
            <div className="mt-5 space-y-3">
              {[
                ['Date', formatDateLabel(session.sessionDate)],
                ['Window', formatWindow(session)],
                ['Grace period', `${session.graceMinutes} minutes`],
                ['Participants', `${participants.length}`],
                ['Recorded check-ins', `${attendance.length}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
                  <p className="text-sm text-brand-muted">{label}</p>
                  <p className="text-sm font-semibold text-brand-text">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-brand-text">Presentation actions</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => toast.info('Fullscreen presentation will be added soon.')}>
                <Expand className="size-4" />
                Present fullscreen
              </Button>
              <Button variant="secondary" onClick={() => toast.success('Timer reset.')}>
                <TimerReset className="size-4" />
                Reset timer
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
