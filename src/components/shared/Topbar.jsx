import { Bell, LogOut, Search, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import {
  useAccessibleOrganizations,
  useUnreadNotifications,
} from '../../app/store/hooks'
import { useAppStore } from '../../app/store/useAppStore'
import {
  formatRole,
  getCurrentUser,
} from '../../app/store/selectors'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select } from '../ui/select'

export function Topbar() {
  const navigate = useNavigate()
  const currentUser = useAppStore(getCurrentUser)
  const accessibleOrganizations = useAccessibleOrganizations()
  const selectedOrganizationId = useAppStore((state) => state.ui.selectedOrganizationId)
  const setSelectedOrganization = useAppStore((state) => state.setSelectedOrganization)
  const signOut = useAppStore((state) => state.signOut)
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead)
  const unreadNotifications = useUnreadNotifications()

  if (!currentUser) {
    return null
  }

  const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`
  const activeOrganization = accessibleOrganizations.find(
    (organization) => organization.id === selectedOrganizationId,
  )

  return (
    <header className="sticky top-0 z-20 mb-6 border-b border-white/70 bg-brand-bg/90 backdrop-blur">
      <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center">
        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input className="bg-white pl-10" placeholder="Search current workspace context" />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Badge tone="info">System healthy</Badge>
          <div className="min-w-64 rounded-2xl border bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Organization scope</p>
            {accessibleOrganizations.length > 1 ? (
              <Select
                className="mt-2 border-none bg-transparent px-0 py-0 text-sm font-semibold shadow-none focus:ring-0"
                value={selectedOrganizationId ?? ''}
                onChange={(event) => setSelectedOrganization(event.target.value)}
              >
                {accessibleOrganizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </Select>
            ) : (
              <p className="mt-2 text-sm font-semibold text-brand-text">
                {activeOrganization?.name ?? 'Select a workspace'}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => {
              markAllNotificationsRead()
              navigate('/app/profile')
            }}
          >
            <Bell className="size-4" />
            <span
              className={cn(
                'text-sm',
                unreadNotifications.length > 0 ? 'text-brand-text' : 'text-brand-muted',
              )}
            >
              {unreadNotifications.length} unread
            </span>
          </Button>
          <Link to="/app/profile" className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary to-brand-accent font-semibold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-brand-text">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-brand-muted">{formatRole(currentUser.role)}</p>
            </div>
          </Link>
          <div className="hidden rounded-2xl border bg-white px-4 py-2.5 xl:flex xl:items-center xl:gap-2">
            <Sparkles className="size-4 text-brand-accent" />
            <span className="text-sm text-brand-muted">Prototype mode</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              signOut()
              navigate('/sign-in')
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
