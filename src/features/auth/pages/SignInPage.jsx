import { useState } from 'react'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useAppStore } from '../../../app/store/useAppStore'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Tabs } from '../../../components/ui/tabs'
import { AuthFormShell } from '../components/AuthFormShell'

const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone number is required.')
    .refine(
      (value) =>
        z.string().email().safeParse(value).success || /^\+?[0-9()\-\s]{8,}$/.test(value),
      'Enter a valid email address or phone number.',
    ),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export function SignInPage() {
  const [authMethod, setAuthMethod] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signIn = useAppStore((state) => state.signIn)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  function fillDemo(identifier, password, method) {
    setAuthMethod(method)
    setValue('identifier', identifier, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
  }

  function onSubmit(values) {
    setIsSubmitting(true)
    window.setTimeout(() => {
      const result = signIn(values)

      setIsSubmitting(false)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success('Signed in successfully. Opening the admin workspace.')
      navigate(location.state?.from?.pathname ?? '/app/dashboard')
    }, 500)
  }

  return (
    <AuthFormShell
      title="Sign in to the admin workspace"
      description="Use a documented admin account to access organizations, departments, users, sessions, attendance, and reports."
      footer={
        <>
          Need a new organization workspace?{' '}
          <Link className="font-semibold text-brand-primary" to="/register">
            Register here
          </Link>
        </>
      }
    >
      <Tabs
        className="mb-6"
        items={[
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
        ]}
        value={authMethod}
        onValueChange={setAuthMethod}
      />
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-label">
            {authMethod === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <Input
            placeholder={authMethod === 'email' ? 'admin@organization.com' : '+1 (555) 555-0100'}
            {...register('identifier')}
          />
          {errors.identifier ? (
            <p className="mt-2 text-sm text-brand-danger">{errors.identifier.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-2 block text-label">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pr-12"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-2 text-sm text-brand-danger">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <Link className="text-sm font-medium text-brand-primary" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button fullWidth disabled={!isValid || isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <Card className="mt-6 border-blue-100 bg-blue-50/80">
        <p className="text-caption text-blue-600">Demo admin accounts</p>
        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left transition hover:border-blue-300"
            onClick={() => fillDemo('mia.reynolds@smartattendance.test', 'Admin123!', 'email')}
          >
            <p className="font-semibold text-brand-text">Super admin</p>
            <p className="mt-1 text-sm text-brand-muted">mia.reynolds@smartattendance.test</p>
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left transition hover:border-blue-300"
            onClick={() => fillDemo('arthur.blake@northwind.edu', 'Northwind123!', 'email')}
          >
            <p className="font-semibold text-brand-text">Organization admin</p>
            <p className="mt-1 text-sm text-brand-muted">arthur.blake@northwind.edu</p>
          </button>
        </div>
      </Card>
    </AuthFormShell>
  )
}
