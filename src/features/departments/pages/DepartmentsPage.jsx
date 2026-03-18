import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useAccessibleOrganizations,
  useScopedDepartments,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  getOrganizationById,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { ScopeFilters } from '../../../components/shared/ScopeFilters'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Dialog } from '../../../components/ui/dialog'
import { EmptyState } from '../../../components/ui/empty-state'
import { Input } from '../../../components/ui/input'

const emptyForm = {
  name: '',
  description: '',
}

export function DepartmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formState, setFormState] = useState(emptyForm)
  const organizations = useAccessibleOrganizations()
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const selectedDepartmentId = useAppStore((state) => state.ui.selectedDepartmentId)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment)
  const createDepartment = useAppStore((state) => state.createDepartment)
  const updateDepartment = useAppStore((state) => state.updateDepartment)
  const departmentList = useScopedDepartments(selectedOrganizationId)
  const users = useAppStore((state) => state.users)
  const sessions = useAppStore((state) => state.sessions)
  const selectedOrganization = useAppStore((state) =>
    getOrganizationById(state, selectedOrganizationId),
  )

  const departmentRows = useMemo(
    () =>
      departmentList.map((department) => ({
        ...department,
        attendeeCount: users.filter((user) => user.departmentId === department.id && user.role === 'attendee').length,
        sessionCount: sessions.filter((session) => session.departmentId === department.id).length,
      })),
    [departmentList, sessions, users],
  )

  function openCreateDialog() {
    if (!selectedOrganizationId) {
      toast.error('Select an organization first.')
      return
    }

    setEditingId(null)
    setFormState(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(department) {
    setEditingId(department.id)
    setFormState({
      name: department.name,
      description: department.description,
    })
    setDialogOpen(true)
  }

  function submitForm() {
    if (!selectedOrganizationId || !formState.name) {
      toast.error('Organization scope and department name are required.')
      return
    }

    if (editingId) {
      updateDepartment(editingId, formState)
      toast.success('Department updated.')
    } else {
      createDepartment({
        organizationId: selectedOrganizationId,
        ...formState,
      })
      toast.success('Department created.')
    }

    setDialogOpen(false)
    setEditingId(null)
    setFormState(emptyForm)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Departments"
        title="Create departments after organization selection"
        description="The requirements documents place departments under organizations. Select the organization first, then add or edit its departments before registering users or sessions."
        actionLabel="New department"
        onAction={openCreateDialog}
      />

      <Card>
        <ScopeFilters
          organizations={organizations}
          departments={departmentRows}
          selectedOrganizationId={selectedOrganizationId}
          selectedDepartmentId={selectedDepartmentId}
          onOrganizationChange={setSelectedOrganization}
          onDepartmentChange={setSelectedDepartment}
          organizationDisabled={organizations.length === 1}
          departmentDisabled={!selectedOrganizationId}
        />
      </Card>

      {!selectedOrganization ? (
        <EmptyState
          title="Select an organization to continue"
          description="Department management is scoped to an organization. Once the organization is selected, departments can be created and later used for user and session assignment."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {departmentRows.map((department) => (
            <Card key={department.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-brand-text">{department.name}</h2>
                    <Badge tone={selectedDepartmentId === department.id ? 'info' : 'neutral'}>
                      {selectedDepartmentId === department.id ? 'Selected' : 'Available'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-brand-muted">{department.description}</p>
                </div>
                <Badge tone="info">{selectedOrganization.name}</Badge>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <p className="text-sm text-brand-muted">Attendees</p>
                  <p className="mt-2 text-2xl font-semibold text-brand-text">{department.attendeeCount}</p>
                </div>
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <p className="text-sm text-brand-muted">Sessions</p>
                  <p className="mt-2 text-2xl font-semibold text-brand-text">{department.sessionCount}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setSelectedDepartment(department.id)}>
                  Use this department
                </Button>
                <Button variant="ghost" onClick={() => openEditDialog(department)}>
                  Edit
                </Button>
                <Link to="/app/users" className="inline-flex">
                  <Button variant="ghost">Manage users</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        title={editingId ? 'Edit department' : 'Create department'}
        description="Departments are required before assigning attendees and before creating department-specific sessions."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>{editingId ? 'Save changes' : 'Create department'}</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-label">Organization</label>
            <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm font-medium text-brand-text">
              {selectedOrganization?.name ?? 'Select organization first'}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-label">Department name</label>
            <Input
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Computer Science"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Description</label>
            <Input
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
              placeholder="Lecture and lab attendance for degree cohorts."
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
