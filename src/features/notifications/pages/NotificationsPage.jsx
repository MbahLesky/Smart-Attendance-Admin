import { useState } from 'react'
import { BellOff, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { EmptyState } from '../../../components/ui/empty-state'
import { Tabs } from '../../../components/ui/tabs'
import { notifications as seedNotifications } from '../../../lib/mock-data'

export function NotificationsPage() {
  const [mode, setMode] = useState('all')
  const notifications =
    mode === 'unread' ? seedNotifications.filter((item) => !item.read) : seedNotifications

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Notifications"
        description="A clean inbox for system events and operational follow-up."
        secondaryAction={
          <Tabs
            items={[
              { label: 'All', value: 'all' },
              { label: 'Unread', value: 'unread' },
              { label: 'Empty', value: 'empty' },
            ]}
            value={mode}
            onValueChange={setMode}
          />
        }
        actionLabel="Mark all read"
        onAction={() => toast.success('All notifications marked as read locally.')}
      />
      <Card>
        {mode === 'empty' ? (
          <EmptyState
            icon={BellOff}
            title="You’re all caught up"
            description="When session alerts, threshold warnings, or report completions appear, they’ll show up here."
            actionLabel="Refresh feed"
            onAction={() => {
              setMode('all')
              toast.success('Feed refreshed.')
            }}
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-3xl border p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-brand-text">{item.title}</p>
                      <Badge tone={item.tone}>{item.read ? 'Read' : 'Unread'}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-brand-muted">{item.message}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="size-4" />
                    {item.time}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
