import { QrCode, TimerReset } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export function QRAttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="QR attendance"
        title="Display session QR for attendee scan"
        description="Displays QR Code"
        actionLabel="Generate new code"
        onAction={() => toast.success('QR token regenerated.')}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="bg-slate-950 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-slate-400">Live QR code</p>
              <h2 className="mt-2 text-2xl font-semibold">Morning Class</h2>
            </div>
            <Badge tone="success">Open</Badge>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="flex size-72 items-center justify-center rounded-[2.25rem] border border-white/10 bg-white/5">
              <QrCode className="size-28 text-cyan-300" />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <p className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-300">
              Code expires in 04:32
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-brand-text">Controls</h2>
          <div className="mt-5 space-y-4">
            {[
              ['Time', '08:00 - 09:00'],
              ['Grace period', '10 minutes'],
              ['Expected attendees', '280'],
              ['Current check-ins', '241'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
                <p className="text-sm text-brand-muted">{label}</p>
                <p className="text-sm font-semibold text-brand-text">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => toast.info('Fullscreen mode can be connected later.')}>
              Full screen
            </Button>
            <Button variant="secondary" onClick={() => toast.success('Countdown reset.')}>
              <TimerReset className="size-4" />
              Reset timer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
