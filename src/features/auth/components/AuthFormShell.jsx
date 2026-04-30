import { Link } from 'react-router-dom'

import { AppLogo } from '../../../components/shared/AppLogo'

export function AuthFormShell({ title, description, footer, children }) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <Link to="/" className="mb-6 inline-flex lg:hidden">
          <AppLogo logoClassName="h-12 sm:h-14" />
        </Link>
        <p className="text-caption">Secure access</p>
        <h1 className="mt-2 text-headline">{title}</h1>
        <p className="mt-3 text-body">{description}</p>
      </div>
      {children}
      {footer ? <div className="mt-6 text-sm text-brand-muted">{footer}</div> : null}
      <p className="mt-8 text-xs text-brand-muted">
        By continuing, you agree to the Smart Attendance terms and privacy notice.
      </p>
      <p className="mt-4 text-xs text-brand-muted">
        Need the product overview? <Link className="text-brand-primary" to="/">Return to landing page</Link>
      </p>
    </div>
  )
}
