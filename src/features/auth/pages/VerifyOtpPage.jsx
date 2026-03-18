import { useState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAppStore } from '../../../app/store/useAppStore'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { AuthFormShell } from '../components/AuthFormShell'

export function VerifyOtpPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const verification = useAppStore((state) => state.auth.verification)
  const completeRegistration = useAppStore((state) => state.completeRegistration)
  const completePasswordReset = useAppStore((state) => state.completePasswordReset)
  const navigate = useNavigate()
  const isComplete = code.every((item) => item.length === 1)
  const isPasswordReset = verification?.type === 'password_reset'
  const passwordIsValid =
    !isPasswordReset || (newPassword.length >= 8 && newPassword === confirmPassword)

  function updateCode(index, value) {
    const clean = value.replace(/\D/g, '').slice(0, 1)
    setCode((current) => current.map((item, itemIndex) => (itemIndex === index ? clean : item)))
  }

  function handleVerify() {
    setLoading(true)
    window.setTimeout(() => {
      const otp = code.join('')
      const result = isPasswordReset
        ? completePasswordReset({
            code: otp,
            password: newPassword,
          })
        : completeRegistration(otp)

      setLoading(false)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(
        isPasswordReset
          ? 'Password reset completed. You can sign in with the new password.'
          : 'Workspace verified successfully.',
      )
      navigate(isPasswordReset ? '/sign-in' : '/app/dashboard')
    }, 500)
  }

  if (!verification) {
    return (
      <AuthFormShell
        title="No verification in progress"
        description="Start from registration or password recovery so the correct verification flow can be resumed."
      >
        <Card className="border-dashed bg-slate-50">
          <p className="text-sm text-brand-muted">
            This screen only opens after registration or password reset has placed a verification payload in store state.
          </p>
          <div className="mt-4 flex gap-3">
            <Link className="text-sm font-semibold text-brand-primary" to="/register">
              Go to registration
            </Link>
            <Link className="text-sm font-semibold text-brand-primary" to="/forgot-password">
              Go to password reset
            </Link>
          </div>
        </Card>
      </AuthFormShell>
    )
  }

  return (
    <AuthFormShell
      title="Verify your access code"
      description={
        isPasswordReset
          ? `Confirm the reset code for ${verification.email}, then set the new password.`
          : `Confirm the organization admin setup for ${verification.payload.organizationName}.`
      }
    >
      <div className="rounded-3xl border bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-brand-primary" />
          <p className="text-sm text-brand-muted">
            Demo tip: use <span className="font-semibold text-brand-text">482913</span> to continue the local-only flow.
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        {code.map((value, index) => (
          <Input
            key={index}
            value={value}
            onChange={(event) => updateCode(index, event.target.value)}
            className="h-14 text-center text-lg font-semibold"
            inputMode="numeric"
          />
        ))}
      </div>
      {isPasswordReset ? (
        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-label">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Create a new password"
            />
          </div>
          <div>
            <label className="mb-2 block text-label">Confirm new password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the new password"
            />
            {confirmPassword && confirmPassword !== newPassword ? (
              <p className="mt-2 text-sm text-brand-danger">Passwords do not match.</p>
            ) : null}
          </div>
        </div>
      ) : null}
      <Button
        className="mt-6"
        fullWidth
        disabled={!isComplete || !passwordIsValid || loading}
        onClick={handleVerify}
      >
        {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {loading ? 'Verifying...' : isPasswordReset ? 'Reset password' : 'Verify and continue'}
      </Button>
    </AuthFormShell>
  )
}
