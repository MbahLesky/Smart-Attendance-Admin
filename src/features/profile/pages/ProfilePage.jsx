import { toast } from 'sonner'

import { useUnreadNotifications } from '../../../app/store/hooks'
import { useAppStore } from '../../../app/store/useAppStore'
import { formatRole, getCurrentUser } from '../../../app/store/selectors'
import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'

export function ProfilePage() {
  const currentUser = useAppStore(getCurrentUser)
  const unreadNotifications = useUnreadNotifications()
  const updateCurrentProfile = useAppStore((state) => state.updateCurrentProfile)

  if (!currentUser) {
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="My profile"
        description="Profile editing is disabled for now."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-slate-950 text-white">
          <p className="text-caption text-slate-400">Signed-in role</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {currentUser.firstName} {currentUser.lastName}
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge tone="info">{formatRole(currentUser.role)}</Badge>
            <Badge>{currentUser.status}</Badge>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-2 font-semibold">{currentUser.email}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Phone</p>
              <p className="mt-2 font-semibold">{currentUser.phone}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Unread notifications</p>
              <p className="mt-2 font-semibold">{unreadNotifications.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-label">First name</label>
              <Input
                value={currentUser.firstName}
                onChange={(event) => updateCurrentProfile({ firstName: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-label">Last name</label>
              <Input
                value={currentUser.lastName}
                onChange={(event) => updateCurrentProfile({ lastName: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-label">Email</label>
              <Input value={currentUser.email} disabled />
            </div>
            <div>
              <label className="mb-2 block text-label">Phone</label>
              <Input
                value={currentUser.phone}
                onChange={(event) => updateCurrentProfile({ phone: event.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => toast.success('Profile changes are already reflected in local state.')}>
              Save profile
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
