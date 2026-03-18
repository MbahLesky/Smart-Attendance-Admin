import { Badge } from '../ui/badge'
import { Card } from '../ui/card'

export function StatCard({ label, value, detail, tone = 'info', badge }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-brand-muted">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-brand-text">{value}</p>
          {detail ? <p className="mt-3 text-sm text-brand-muted">{detail}</p> : null}
        </div>
        {badge ? <Badge tone={tone}>{badge}</Badge> : null}
      </div>
    </Card>
  )
}
