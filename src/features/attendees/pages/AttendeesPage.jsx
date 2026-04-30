import { useMemo, useState } from 'react'
import { UserPlus, UsersRound } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { DataTable } from '../../../components/ui/data-table'
import { Dialog } from '../../../components/ui/dialog'
import { DropdownMenu } from '../../../components/ui/dropdown-menu'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { attendees } from '../../../lib/mock-data'

export function AttendeesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(
    () =>
      attendees.filter((item) => {
        const matchesSearch = [item.name, item.email, item.department].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        )
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [search, statusFilter],
  )

  const columns = [
    {
      header: 'Attendee',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-brand-text">{row.original.name}</p>
          <p className="mt-1 text-sm text-brand-muted">{row.original.email}</p>
        </div>
      ),
    },
    { header: 'Department', cell: ({ row }) => row.original.department },
    { header: 'Phone', cell: ({ row }) => row.original.phone },
    { header: 'Rate', cell: ({ row }) => row.original.attendanceRate },
    { header: 'Status', cell: ({ row }) => <Badge>{row.original.status}</Badge> },
    {
      header: 'Actions',
      cell: () => (
        <DropdownMenu
          items={[
            { label: 'Open profile', onClick: () => toast.info('Profile drawer can be connected later.') },
            { label: 'Reset access', onClick: () => toast.success('Mock reset email sent.') },
            { label: 'Deactivate', danger: true, onClick: () => toast.warning('Local-only deactivate state.') },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attendee management"
        title="Manage attendees"
        description="This table mirrors the documented attendee registration flow with department assignment and status visibility."
        actionLabel="Add attendee"
        onAction={() => setOpen(true)}
      />

      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <Input
              className="sm:max-w-md"
              placeholder="Search attendee name, email, or department"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select className="sm:max-w-xs" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Attention">Attention</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
          <Button variant="secondary" onClick={() => toast.info('Bulk import is not connected yet.')}>
            <UsersRound className="size-4" />
            Bulk upload
          </Button>
        </div>
        <div className="mt-6">
          <DataTable columns={columns} data={filtered} />
        </div>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Register attendee"
        description="Frontend-only attendee registration with the required SRS fields."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Attendee created successfully.')
                setOpen(false)
              }}
            >
              Save attendee
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-label">Full name</label>
            <Input placeholder="Tangka Felicity" />
          </div>
          <div>
            <label className="mb-2 block text-label">Email address</label>
            <Input placeholder="tangkafelicity@gmail.com" />
          </div>
          <div>
            <label className="mb-2 block text-label">Phone number</label>
            <Input placeholder="+1 (555) 555-0100" />
          </div>
          <div>
            <label className="mb-2 block text-label">Department</label>
            <Select defaultValue="">
              <option value="" disabled>
                Assign department
              </option>
              <option>Computer Science</option>
              <option>Software Engineering</option>
              <option>Computer Engineering</option>
            </Select>
          </div>
        </div>
      </Dialog>

      <div className="rounded-2xl border bg-slate-50 p-4">
        <p className="font-semibold text-brand-text">Notes</p>
        <p className="mt-1 text-sm text-brand-muted">
          Attendees added here become part of the organization roster and can be selected when building sessions.
        </p>
      </div>
    </div>
  )
}
