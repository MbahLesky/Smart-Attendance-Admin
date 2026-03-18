import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useAppStore } from '../../../app/store/useAppStore'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { AuthFormShell } from '../components/AuthFormShell'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
})

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const beginPasswordReset = useAppStore((state) => state.beginPasswordReset)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange',
  })

  function onSubmit(values) {
    setLoading(true)
    window.setTimeout(() => {
      const result = beginPasswordReset(values.email)

      setLoading(false)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success('Reset verification started. Continue with code 482913.')
      navigate('/verify')
    }, 500)
  }

  return (
    <AuthFormShell
      title="Recover access"
      description="Request a verification code for password reset, then confirm the reset before returning to sign in."
      footer={
        <>
          Remembered your password?{' '}
          <Link className="font-semibold text-brand-primary" to="/sign-in">
            Return to sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-label">Work email</label>
          <Input placeholder="admin@organization.com" {...register('email')} />
          {errors.email ? <p className="mt-2 text-sm text-brand-danger">{errors.email.message}</p> : null}
        </div>
        <Button fullWidth disabled={!isValid || loading}>
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {loading ? 'Starting verification...' : 'Send reset code'}
        </Button>
      </form>
    </AuthFormShell>
  )
}
