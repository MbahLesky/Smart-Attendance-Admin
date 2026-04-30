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

const registerSchema = z
  .object({
    organizationName: z.string().min(2, 'Organization name is required.'),
    address: z.string().min(6, 'Organization address is required.'),
    firstName: z.string().min(2, 'First name is required.'),
    lastName: z.string().min(2, 'Last name is required.'),
    email: z.string().email('Enter a valid work email.'),
    phone: z.string().regex(/^\+?[0-9()\-\s]{8,}$/, 'Enter a valid phone number.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const beginRegistration = useAppStore((state) => state.beginRegistration)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  function onSubmit(values) {
    setIsSubmitting(true)
    window.setTimeout(() => {
      beginRegistration(values)
      setIsSubmitting(false)
      toast.success('Registration details captured. Continue to verification with code 482913.')
      navigate('/verify')
    }, 500)
  }

  return (
    <AuthFormShell
      title="Create your Smart Attendance workspace"
      description="Register an organization and primary organization admin account before adding departments, users, sessions, and attendance activity."
      footer={
        <>
          Already have access?{' '}
          <Link className="font-semibold text-brand-primary" to="/sign-in">
            Sign in instead
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Organization name</label>
            <Input placeholder="Bauhaven Organization" {...register('organizationName')} />
            {errors.organizationName ? (
              <p className="mt-2 text-sm text-brand-danger">{errors.organizationName.message}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-label">Organization address</label>
            <Input placeholder="Mile 4 Nkwen, Bamenda, Cameroon" {...register('address')} />
            {errors.address ? <p className="mt-2 text-sm text-brand-danger">{errors.address.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-label">Admin first name</label>
            <Input placeholder="Felicity" {...register('firstName')} />
            {errors.firstName ? (
              <p className="mt-2 text-sm text-brand-danger">{errors.firstName.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-label">Admin last name</label>
            <Input placeholder="Tangka" {...register('lastName')} />
            {errors.lastName ? (
              <p className="mt-2 text-sm text-brand-danger">{errors.lastName.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-label">Work email</label>
            <Input placeholder="admin@organization.com" {...register('email')} />
            {errors.email ? <p className="mt-2 text-sm text-brand-danger">{errors.email.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-label">Phone number</label>
            <Input placeholder="+1 (555) 555-0100" {...register('phone')} />
            {errors.phone ? <p className="mt-2 text-sm text-brand-danger">{errors.phone.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-label">Password</label>
            <Input type="password" placeholder="Create a password" {...register('password')} />
            {errors.password ? (
              <p className="mt-2 text-sm text-brand-danger">{errors.password.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-label">Confirm password</label>
            <Input type="password" placeholder="Repeat your password" {...register('confirmPassword')} />
            {errors.confirmPassword ? (
              <p className="mt-2 text-sm text-brand-danger">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
        </div>
        <Button fullWidth disabled={!isValid || isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? 'Creating workspace...' : 'Create account'}
        </Button>
      </form>
    </AuthFormShell>
  )
}
