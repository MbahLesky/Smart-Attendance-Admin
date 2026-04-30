import { PageHeader } from '../../../components/shared/PageHeader'
import { Badge } from '../../../components/ui/badge'
import { Card } from '../../../components/ui/card'
import { historyRecords } from '../../../lib/mock-data'

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attendance history"
        title="Attendance history"
        description="View past attendance records"
      />
      <Card>
        <div className="space-y-4">
          {historyRecords.map((item) => (
            <div key={item.id} className="rounded-3xl border p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-brand-text">{item.session}</p>
                  <p className="mt-1 text-sm text-brand-muted">
                    {item.attendee} • {item.date}
                  </p>
                </div>
                <Badge>{item.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-brand-muted">{item.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
