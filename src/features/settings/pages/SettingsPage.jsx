import { toast } from 'sonner'

import { useAppStore } from '../../../app/store/useAppStore'
import { PageHeader } from '../../../components/shared/PageHeader'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export function SettingsPage() {
  const settings = useAppStore((state) => state.settings)
  const updateSettings = useAppStore((state) => state.updateSettings)
  const resetDemo = useAppStore((state) => state.resetDemo)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Settings remain frontend-only in this phase, but they are centralized so backend preferences can replace them later without rewriting the UI."
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <div className="space-y-4">
            {[
              ['emailNotifications', 'Email notifications', 'Send summary notifications to admin accounts.'],
              ['securityAlerts', 'Security alerts', 'Notify admins when attendance exceptions or auth issues occur.'],
              ['dailyDigest', 'Daily digest', 'Aggregate daily attendance summaries by scope.'],
              ['autoCloseSessions', 'Auto-close sessions', 'Simulate automatic session closing at the configured end time.'],
              ['requireManualReason', 'Manual entry reason required', 'Keep a remark whenever attendance is manually edited.'],
            ].map(([key, title, description]) => (
              <label key={key} className="flex items-start justify-between gap-4 rounded-3xl border p-4">
                <div>
                  <p className="font-semibold text-brand-text">{title}</p>
                  <p className="mt-2 text-sm text-brand-muted">{description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(event) => updateSettings({ [key]: event.target.checked })}
                  className="mt-1 size-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-950 text-white">
          <p className="text-caption text-slate-400">Data tools</p>
          <h2 className="mt-2 text-2xl font-semibold">Reset data</h2>
          <p className="mt-4 text-sm text-slate-300">
            Reset the local store to the seeded dataset.
          </p>
          <div className="mt-6 rounded-3xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Default grace minutes</p>
            <p className="mt-2 text-3xl font-semibold">{settings.defaultGraceMinutes}</p>
          </div>
          <Button
            className="mt-6 w-full"
            variant="secondary"
            onClick={() => {
              const confirm = window.confirm('Are you sure you want to reset all data? This will clear all changes.')
              if (confirm) {
                resetStore()
                toast.success('Data reset to the seeded state.')
              }
            }}
          >
            Reset data
          </Button>
        </Card>
      </section>
    </div>
  )
}
