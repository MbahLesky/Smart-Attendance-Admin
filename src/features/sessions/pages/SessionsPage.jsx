import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useAccessibleOrganizations,
  useScopedDepartments,
  useScopedSessions,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatDateLabel,
  formatWindow,
  getOrganizationById,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { ScopeFilters } from '../../../components/shared/ScopeFilters'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { DataTable } from '../../../components/ui/data-table'
import { Dialog } from '../../../components/ui/dialog'
import { EmptyState } from '../../../components/ui/empty-state'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { Tabs } from '../../../components/ui/tabs'

const emptyForm = {
  title: '',
  description: '',
  sessionDate: '',
  startTime: '',
  endTime: '',
  graceMinutes: '10',
  attendanceMethod: 'qr',
  locationRequired: false,
}

export function SessionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchValue, setSearchValue] = useState('')
  const [formState, setFormState] = useState(emptyForm)
  const navigate = useNavigate()
  const organizations = useAccessibleOrganizations()
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const selectedDepartmentId = useAppStore((state) => state.ui.selectedDepartmentId)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment)
  const setSelectedSession = useAppStore((state) => state.setSelectedSession)
  const createSession = useAppStore((state) => state.createSession)
  const openSessionQr = useAppStore((state) => state.openSessionQr)
  const departments = useScopedDepartments(selectedOrganizationId)
  const sessions = useScopedSessions({
    organizationId: selectedOrganizationId,
    departmentId: selectedDepartmentId,
  })
  const participants = useAppStore((state) => state.sessionParticipants)
  const attendanceRecords = useAppStore((state) => state.attendanceRecords)

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        const matchesStatus = statusFilter === 'all' ? true : session.status === statusFilter
        const search = searchValue.toLowerCase()
        const matchesSearch = [session.title, session.description ?? ''].some((value) =>
          value.toLowerCase().includes(search),
        )

        return matchesStatus && matchesSearch
      }),
    [searchValue, sessions, statusFilter],
  )

  const columns = [
    {
      header: 'Session',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-brand-text">{row.original.title}</p>
          <p className="mt-1 text-sm text-brand-muted">{row.original.description}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      cell: ({ row }) => formatDateLabel(row.original.sessionDate),
    },
    {
      header: 'Window',
      cell: ({ row }) => formatWindow(row.original),
    },
    {
      header: 'Grace',
      cell: ({ row }) => `${row.original.graceMinutes} min`,
    },
    {
      header: 'Status',
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSession(row.original.id)
              navigate(`/app/sessions/${row.original.id}`)
            }}
          >
            View details
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenQr(row.original.id)}
          >
            {row.original.status === 'draft' ? 'Generate QR' : 'Open QR'}
          </Button>
        </div>
      ),
    },
  ]

  function handleOpenQr(sessionId) {
    const result = openSessionQr(sessionId)

    if (!result.success) {
      toast.error(result.message)
      return
    }

    setSelectedSession(sessionId)
    navigate(`/app/sessions/${sessionId}/qr`)
  }

  function openCreateDialog() {
    if (!selectedOrganizationId || !selectedDepartmentId) {
      toast.error('Select organization and department before creating a session.')
      return
    }

    setFormState(emptyForm)
    setDialogOpen(true)
  }

  function submitForm() {
    if (!selectedOrganizationId || !selectedDepartmentId) {
      toast.error('Session creation requires organization and department context.')
      return
    }

    if (!formState.title || !formState.sessionDate || !formState.startTime || !formState.endTime) {
      toast.error('Title, date, start time, and end time are required.')
      return
    }

    if (formState.endTime <= formState.startTime) {
      toast.error('Session end time must be later than start time.')
      return
    }

    const session = createSession({
      organizationId: selectedOrganizationId,
      departmentId: selectedDepartmentId,
      title: formState.title,
      description: formState.description,
      sessionDate: formState.sessionDate,
      startTime: formState.startTime,
      endTime: formState.endTime,
      graceMinutes: Number(formState.graceMinutes),
      attendanceMethod: formState.attendanceMethod,
      locationRequired: formState.locationRequired,
    })

    toast.success('Session created as draft. Open QR only after reviewing the session.')
    setDialogOpen(false)
    navigate(`/app/sessions/${session.id}`)
  }

  const selectedOrganization = useAppStore((state) =>
    getOrganizationById(state, selectedOrganizationId),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sessions"
        title="Create sessions"
        description="Select organization and department context first, then create sessions and open QR check-in."
        actionLabel="New session"
        onAction={openCreateDialog}
      />

      <Card>
        <ScopeFilters
          organizations={organizations}
          departments={departments}
          selectedOrganizationId={selectedOrganizationId}
          selectedDepartmentId={selectedDepartmentId}
          onOrganizationChange={setSelectedOrganization}
          onDepartmentChange={setSelectedDepartment}
          organizationDisabled={organizations.length === 1}
          departmentDisabled={!selectedOrganizationId}
        />
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Tabs
            items={[
              { label: 'All', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Closed', value: 'closed' },
            ]}
            value={statusFilter}
            onValueChange={setStatusFilter}
          />
          <Input
            className="max-w-md"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search session title or description"
          />
        </div>
      </Card>

      {!selectedOrganization ? (
        <EmptyState
          title="Select organization and department"
          description="Session management is scoped to an organization and department. Once both are selected, session creation and QR actions will become available."
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-caption">Current scope</p>
                <h2 className="mt-2 text-xl font-semibold text-brand-text">
                  {selectedOrganization.name}
                </h2>
                <p className="mt-2 text-sm text-brand-muted">
                  {filteredSessions.length} sessions in the current result set.
                </p>
              </div>
              <Badge tone="info">{selectedDepartmentId ? 'Department filtered' : 'All departments'}</Badge>
            </div>
            <DataTable columns={columns} data={filteredSessions} />
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            {filteredSessions.slice(0, 4).map((session) => {
              const participantCount = participants.filter((participant) => participant.sessionId === session.id).length
              const checkIns = attendanceRecords.filter((record) => record.sessionId === session.id).length

              return (
                <Card key={session.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-brand-text">{session.title}</h3>
                        <Badge>{session.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-brand-muted">{formatDateLabel(session.sessionDate)}</p>
                    </div>
                    <Badge tone="info">{session.attendanceMethod}</Badge>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="text-sm text-brand-muted">Participants</p>
                      <p className="mt-2 text-2xl font-semibold text-brand-text">{participantCount}</p>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="text-sm text-brand-muted">Recorded check-ins</p>
                      <p className="mt-2 text-2xl font-semibold text-brand-text">{checkIns}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/app/sessions/${session.id}`}>
                      <Button variant="secondary">View details</Button>
                    </Link>
                    <Button variant="ghost" onClick={() => handleOpenQr(session.id)}>
                      {session.status === 'draft' ? 'Generate/open QR' : 'Open QR'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        title="Create session"
        description="Create the session inside the selected organization and department. QR becomes available only after this context exists."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>Create draft session</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Session title</label>
            <Input
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              placeholder="Morning Assembly"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Description</label>
            <Input
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
              placeholder="Attendance for morning lectures"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Date</label>
            <Input
              type="date"
              value={formState.sessionDate}
              onChange={(event) => setFormState((current) => ({ ...current, sessionDate: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Grace period (minutes)</label>
            <Input
              type="number"
              min="0"
              value={formState.graceMinutes}
              onChange={(event) => setFormState((current) => ({ ...current, graceMinutes: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Start time</label>
            <Input
              type="time"
              value={formState.startTime}
              onChange={(event) => setFormState((current) => ({ ...current, startTime: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-label">End time</label>
            <Input
              type="time"
              value={formState.endTime}
              onChange={(event) => setFormState((current) => ({ ...current, endTime: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Attendance method</label>
            <Select
              value={formState.attendanceMethod}
              onChange={(event) => setFormState((current) => ({ ...current, attendanceMethod: event.target.value }))}
            >
              <option value="qr">QR</option>
              <option value="manual">Manual</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-8">
            <input
              id="location-required"
              type="checkbox"
              checked={formState.locationRequired}
              onChange={(event) =>
                setFormState((current) => ({ ...current, locationRequired: event.target.checked }))
              }
              className="size-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="location-required" className="text-sm text-brand-muted">
              Require location for this session
            </label>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
