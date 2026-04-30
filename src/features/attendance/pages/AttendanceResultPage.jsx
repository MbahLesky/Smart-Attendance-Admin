import { CheckCircle2, ClockAlert } from 'lucide-react'

import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Card } from '../../../components/ui/card'

export function AttendanceResultPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attendance confirmation"
        title="Check-in result"
        description="Shows if student checked in successfully"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3">
              <CheckCircle2 className="size-6 text-brand-success" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-brand-text">Check-in successful</h2>
                <Badge tone="success">Present</Badge>
              </div>
              <p className="mt-3 text-sm text-brand-muted">
                Brenda Ndzi checked in to Morning Class at 08:05 on time
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3">
              <ClockAlert className="size-6 text-brand-warning" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-brand-text">Late check-in</h2>
                <Badge tone="warning">Late</Badge>
              </div>
              <p className="mt-3 text-sm text-brand-muted">
                Junior Tambo checked in at 08:20 which is after the allowed time
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
