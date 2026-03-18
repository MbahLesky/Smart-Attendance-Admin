import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  useAccessibleOrganizations,
  useAttendanceMatrix,
  useScopedDepartments,
  useScopedSessions,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatDateLabel,
  formatName,
  formatTimeLabel,
  getSessionById,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { ScopeFilters } from '../../../components/shared/ScopeFilters'
import { StatCard } from '../../../components/shared/StatCard'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { DataTable } from '../../../components/ui/data-table'
import { Dialog } from '../../../components/ui/dialog'
import { EmptyState } from '../../../components/ui/empty-state'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'

const emptyManualForm = {
  userId: '',
  status: 'present',
  remarks: '',
}

export function AttendancePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [manualForm, setManualForm] = useState(emptyManualForm)
  const organizations = useAccessibleOrganizations()
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const selectedDepartmentId = useAppStore((state) => state.ui.selectedDepartmentId)
  const selectedSessionId = useAppStore((state) => state.ui.selectedSessionId)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment)
  const setSelectedSession = useAppStore((state) => state.setSelectedSession)
  const markAttendanceManually = useAppStore((state) => state.markAttendanceManually)
  const departments = useScopedDepartments(selectedOrganizationId)
  const sessions = useScopedSessions({
    organizationId: selectedOrganizationId,
    departmentId: selectedDepartmentId,
  })
  const selectedSession = useAppStore((state) => getSessionById(state, selectedSessionId))
  const attendanceMatrix = useAttendanceMatrix(selectedSessionId)

  const summary = useMemo(() => {
    const present = attendanceMatrix.filter((entry) => entry.record?.status === 'present').length
    const late = attendanceMatrix.filter((entry) => entry.record?.status === 'late').length
    const manual = attendanceMatrix.filter((entry) => entry.record?.method === 'manual').length
    const pending = attendanceMatrix.filter((entry) => !entry.record).length

    return {
      present,
      late,
      manual,
      pending,
      rate: attendanceMatrix.length
        ? Math.round(((present + late) / attendanceMatrix.length) * 100)
        : 0,
    }
  }, [attendanceMatrix])

  const filteredRows = useMemo(
    () =>
      attendanceMatrix.filter((entry) => {
        const derivedStatus = entry.record?.status ?? (selectedSession?.status === 'closed' ? 'absent' : 'pending')
        const matchesStatus = statusFilter === 'all' ? true : derivedStatus === statusFilter
        const matchesSearch = [formatName(entry.participant), entry.participant.email].some((value) =>
          value.toLowerCase().includes(searchValue.toLowerCase()),
        )

        return matchesStatus && matchesSearch
      }),
    [attendanceMatrix, searchValue, selectedSession?.status, statusFilter],
  )

  const columns = [
    {
      header: 'Attendee',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-brand-text">{formatName(row.original.participant)}</p>
          <p className="mt-1 text-sm text-brand-muted">{row.original.participant.email}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge>
          {row.original.record?.status ?? (selectedSession?.status === 'closed' ? 'absent' : 'pending')}
        </Badge>
      ),
    },
    {
      header: 'Method',
      cell: ({ row }) => row.original.record?.method ?? 'Awaiting QR',
    },
    {
      header: 'Check-in',
      cell: ({ row }) =>
        row.original.record
          ? `${formatDateLabel(row.original.record.checkInTime)} / ${formatTimeLabel(new Date(row.original.record.checkInTime).toTimeString().slice(0, 5))}`
          : 'Not recorded yet',
    },
    {
      header: 'Remarks',
      cell: ({ row }) => row.original.record?.remarks || 'No remarks',
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setManualForm({
              userId: row.original.participant.id,
              status: row.original.record?.status ?? 'present',
              remarks: row.original.record?.remarks ?? '',
            })
            setDialogOpen(true)
          }}
        >
          Manual update
        </Button>
      ),
    },
  ]

  function submitManualEntry() {
    if (!selectedSessionId || !manualForm.userId) {
      toast.error('Select a session and attendee first.')
      return
    }

    markAttendanceManually({
      sessionId: selectedSessionId,
      userId: manualForm.userId,
      status: manualForm.status,
      remarks: manualForm.remarks,
    })
    toast.success('Attendance updated.')
    setDialogOpen(false)
    setManualForm(emptyManualForm)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attendance monitoring"
        title="Monitor attendance only after session context is selected"
        description="Attendance records depend on the selected organization, department, and session. This page preserves that documented order and keeps manual entry attached to the current session."
        actionLabel="Manual entry"
        onAction={() => {
          if (!selectedSessionId) {
            toast.error('Choose a session before opening manual entry.')
            return
          }

          setDialogOpen(true)
        }}
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

      {!selectedSession ? (
        <EmptyState
          title="Select organization, department, and session"
          description="The docs define attendance monitoring and manual attendance entry as session-level actions. Select the full context before viewing records or editing attendance."
        />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Participants" value={attendanceMatrix.length} detail="Roster assigned to the selected session." />
            <StatCard label="Present" value={summary.present} detail="Recorded within the session window." badge="QR/manual" tone="success" />
            <StatCard label="Late" value={summary.late} detail="Recorded after the grace period." badge="Derived" tone="warning" />
            <StatCard label="Attendance rate" value={`${summary.rate}%`} detail={`${summary.pending} still pending or absent.`} badge="Live" tone="info" />
          </section>

          <Card>
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-caption">Selected session</p>
                <h2 className="mt-2 text-xl font-semibold text-brand-text">{selectedSession.title}</h2>
                <p className="mt-2 text-sm text-brand-muted">
                  {formatDateLabel(selectedSession.sessionDate)} / {selectedSession.status}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="pending">Pending</option>
                  <option value="absent">Absent</option>
                </Select>
                <Input
                  className="max-w-md"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search attendee or email"
                />
              </div>
            </div>
            <DataTable columns={columns} data={filteredRows} />
          </Card>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        title="Manual attendance entry"
        description="Manual attendance still stays inside the selected session flow, matching the documented process for scan failures or admin overrides."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitManualEntry}>Save attendance</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-label">Attendee</label>
            <Select
              value={manualForm.userId}
              onChange={(event) => setManualForm((current) => ({ ...current, userId: event.target.value }))}
            >
              <option value="">Select attendee</option>
              {attendanceMatrix.map((entry) => (
                <option key={entry.participant.id} value={entry.participant.id}>
                  {formatName(entry.participant)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-label">Status</label>
            <Select
              value={manualForm.status}
              onChange={(event) => setManualForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-label">Remarks</label>
            <Input
              value={manualForm.remarks}
              onChange={(event) => setManualForm((current) => ({ ...current, remarks: event.target.value }))}
              placeholder="Scanner issue or admin override note"
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
