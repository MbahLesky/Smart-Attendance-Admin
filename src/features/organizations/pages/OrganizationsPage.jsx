import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useAccessibleOrganizations } from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatName,
  formatRole,
  getCurrentUser,
} from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
}

export function OrganizationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formState, setFormState] = useState(emptyForm)
  const currentUser = useAppStore(getCurrentUser)
  const organizations = useAccessibleOrganizations()
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const users = useAppStore((state) => state.users)
  const departments = useAppStore((state) => state.departments)
  const sessions = useAppStore((state) => state.sessions)
  const createOrganization = useAppStore((state) => state.createOrganization)
  const updateOrganization = useAppStore((state) => state.updateOrganization)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)

  const organizationRows = useMemo(
    () =>
      organizations.map((organization) => {
        const orgUsers = users.filter((user) => user.organizationId === organization.id)
        const admin = orgUsers.find((user) => user.role === 'organization_admin') ?? null

        return {
          ...organization,
          attendeeCount: orgUsers.filter((user) => user.role === 'attendee').length,
          departmentCount: departments.filter((department) => department.organizationId === organization.id).length,
          sessionCount: sessions.filter((session) => session.organizationId === organization.id).length,
          admin,
        }
      }),
    [departments, organizations, sessions, users],
  )

  const canManageOrganizations = currentUser?.role === 'super_admin'

  function openCreateDialog() {
    setEditingId(null)
    setFormState(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(organization) {
    setEditingId(organization.id)
    setFormState({
      name: organization.name,
      email: organization.email,
      phone: organization.phone,
      address: organization.address,
      status: organization.status,
    })
    setDialogOpen(true)
  }

  function submitForm() {
    if (!formState.name || !formState.address) {
      toast.error('Organization name and address are required.')
      return
    }

    if (editingId) {
      updateOrganization(editingId, formState)
      toast.success('Organization updated.')
    } else {
      createOrganization(formState)
      toast.success('Organization created.')
    }

    setDialogOpen(false)
    setEditingId(null)
    setFormState(emptyForm)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizations"
        title="Manage organizations"
        description={
          canManageOrganizations
            ? 'The docs place organization management at the top of the admin workflow. Super admins create or update organizations before downstream department and user setup.'
            : 'Organization admins can review the current workspace here, but organization creation stays restricted to super admins in the documented access model.'
        }
        actionLabel={canManageOrganizations ? 'New organization' : undefined}
        onAction={canManageOrganizations ? openCreateDialog : undefined}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {organizationRows.map((organization) => (
          <Card key={organization.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-brand-text">{organization.name}</h2>
                  <Badge>{organization.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{organization.address}</p>
              </div>
              <Badge tone={selectedOrganizationId === organization.id ? 'info' : 'neutral'}>
                {selectedOrganizationId === organization.id ? 'Current scope' : 'Available'}
              </Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm text-brand-muted">Departments</p>
                <p className="mt-2 text-2xl font-semibold text-brand-text">{organization.departmentCount}</p>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm text-brand-muted">Attendees</p>
                <p className="mt-2 text-2xl font-semibold text-brand-text">{organization.attendeeCount}</p>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm text-brand-muted">Sessions</p>
                <p className="mt-2 text-2xl font-semibold text-brand-text">{organization.sessionCount}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
              <p className="text-sm text-brand-muted">Primary admin</p>
              <p className="mt-2 font-semibold text-brand-text">
                {organization.admin ? formatName(organization.admin) : 'Not assigned yet'}
              </p>
              <p className="mt-1 text-sm text-brand-muted">
                {organization.admin ? `${organization.admin.email} / ${formatRole(organization.admin.role)}` : organization.email}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setSelectedOrganization(organization.id)}>
                Set as current scope
              </Button>
              {canManageOrganizations ? (
                <Button variant="ghost" onClick={() => openEditDialog(organization)}>
                  Edit organization
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={dialogOpen}
        title={editingId ? 'Edit organization' : 'Create organization'}
        description="Organization records become the first required selection step for department, user, session, and attendance flows."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>{editingId ? 'Save changes' : 'Create organization'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Organization name</label>
            <Input
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Bauhaven Organization"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Work email</label>
            <Input
              value={formState.email}
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              placeholder="admin@organization.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Phone number</label>
            <Input
              value={formState.phone}
              onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+1 (555) 555-0100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Address</label>
            <Input
              value={formState.address}
              onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))}
              placeholder="Mile 4 Nkwen, Bamenda, Cameroon"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Status</label>
            <Select
              value={formState.status}
              onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
