import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  useAccessibleOrganizations,
  useScopedDepartments,
  useScopedUsers,
} from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import {
  formatName,
  formatRole,
  getCurrentUser,
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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'attendee',
  departmentId: '',
  employeeCode: '',
  password: 'Attendee123!',
  status: 'active',
}

export function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchValue, setSearchValue] = useState('')
  const [formState, setFormState] = useState(emptyForm)
  const currentUser = useAppStore(getCurrentUser)
  const organizations = useAccessibleOrganizations()
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const selectedDepartmentId = useAppStore((state) => state.ui.selectedDepartmentId)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const setSelectedDepartment = useAppStore((state) => state.setSelectedDepartment)
  const departments = useScopedDepartments(selectedOrganizationId)
  const users = useScopedUsers({ organizationId: selectedOrganizationId })
  const createUser = useAppStore((state) => state.createUser)
  const updateUser = useAppStore((state) => state.updateUser)
  const toggleUserStatus = useAppStore((state) => state.toggleUserStatus)

  const availableRoles =
    currentUser?.role === 'super_admin' ? ['organization_admin', 'attendee'] : ['attendee']

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesDepartment = selectedDepartmentId ? user.departmentId === selectedDepartmentId : true
        const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter
        const search = searchValue.toLowerCase()
        const matchesSearch = [formatName(user), user.email, user.employeeCode ?? ''].some((value) =>
          value.toLowerCase().includes(search),
        )

        return matchesDepartment && matchesRole && matchesSearch
      }),
    [roleFilter, searchValue, selectedDepartmentId, users],
  )

  const columns = [
    {
      header: 'User',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-brand-text">{formatName(row.original)}</p>
          <p className="mt-1 text-sm text-brand-muted">{row.original.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: ({ row }) => <Badge>{formatRole(row.original.role)}</Badge>,
    },
    {
      header: 'Department',
      cell: ({ row }) =>
        row.original.departmentId
          ? departments.find((department) => department.id === row.original.departmentId)?.name ?? 'Unknown'
          : 'Unassigned',
    },
    {
      header: 'Employee code',
      cell: ({ row }) => row.original.employeeCode ?? 'Not set',
    },
    {
      header: 'Status',
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(row.original)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(row.original.id)}>
            {row.original.status === 'active' ? 'Deactivate' : 'Reactivate'}
          </Button>
        </div>
      ),
    },
  ]

  function openCreateDialog() {
    if (!selectedOrganizationId) {
      toast.error('Select an organization before creating users.')
      return
    }

    setEditingId(null)
    setFormState({
      ...emptyForm,
      departmentId: selectedDepartmentId ?? '',
      role: availableRoles[0],
    })
    setDialogOpen(true)
  }

  function openEditDialog(user) {
    setEditingId(user.id)
    setFormState({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      departmentId: user.departmentId ?? '',
      employeeCode: user.employeeCode ?? '',
      password: user.mockPassword ?? 'Attendee123!',
      status: user.status,
    })
    setDialogOpen(true)
  }

  function submitForm() {
    if (!selectedOrganizationId) {
      toast.error('Organization scope is required.')
      return
    }

    if (!formState.firstName || !formState.lastName || !formState.email) {
      toast.error('First name, last name, and email are required.')
      return
    }

    if (formState.role === 'attendee' && !formState.departmentId) {
      toast.error('Attendees must be assigned to a department.')
      return
    }

    if (editingId) {
      updateUser(editingId, formState)
      toast.success('User updated.')
    } else {
      createUser({
        organizationId: selectedOrganizationId,
        departmentId: formState.role === 'attendee' ? formState.departmentId : null,
        ...formState,
      })
      toast.success('User created.')
    }

    setDialogOpen(false)
    setEditingId(null)
    setFormState(emptyForm)
  }

  const selectedOrganization = useAppStore((state) =>
    getOrganizationById(state, selectedOrganizationId),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User management"
        title="Manage users"
        description="The web flow in the docs places users under an organization and, for attendees, under a department. That scope is enforced here before new users can be created."
        actionLabel="New user"
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
              { label: 'Attendees', value: 'attendee' },
              ...(currentUser?.role === 'super_admin'
                ? [{ label: 'Organization admins', value: 'organization_admin' }]
                : []),
            ]}
            value={roleFilter}
            onValueChange={setRoleFilter}
          />
          <Input
            className="max-w-md"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search user, email, or employee code"
          />
        </div>
      </Card>

      {!selectedOrganization ? (
        <EmptyState
          title="Select organization scope first"
          description="Users are managed within an organization. Select an organization before filtering or creating admins and attendees."
        />
      ) : (
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-caption">Current scope</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-text">{selectedOrganization.name}</h2>
              <p className="mt-2 text-sm text-brand-muted">
                {filteredUsers.length} users in the filtered result set.
              </p>
            </div>
            <Badge tone="info">{selectedDepartmentId ? 'Department filtered' : 'Organization wide'}</Badge>
          </div>
          <DataTable columns={columns} data={filteredUsers} />
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        title={editingId ? 'Edit user' : 'Create user'}
        description="Create users only after the organization is selected. Attendees also require a department assignment to stay aligned with the docs."
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>{editingId ? 'Save changes' : 'Create user'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-label">First name</label>
            <Input
              value={formState.firstName}
              onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))}
              placeholder="Brian"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Last name</label>
            <Input
              value={formState.lastName}
              onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))}
              placeholder="Achu"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Email</label>
            <Input
              value={formState.email}
              onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
              placeholder="brainachu@gmail.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Phone</label>
            <Input
              value={formState.phone}
              onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+1 (555) 212-4101"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Role</label>
            <Select
              value={formState.role}
              onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value }))}
              disabled={editingId && formState.role === 'super_admin'}
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-label">Department</label>
            <Select
              value={formState.departmentId}
              onChange={(event) => setFormState((current) => ({ ...current, departmentId: event.target.value }))}
              disabled={formState.role !== 'attendee'}
            >
              <option value="">Unassigned</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-label">Employee code</label>
            <Input
              value={formState.employeeCode}
              onChange={(event) => setFormState((current) => ({ ...current, employeeCode: event.target.value }))}
              placeholder="NW-CS-1001"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Temporary password</label>
            <Input
              value={formState.password}
              onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
              placeholder="Attendee123!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
