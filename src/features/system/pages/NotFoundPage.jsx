import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export function NotFoundPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <Card className="max-w-xl text-center">
        <p className="text-caption">404</p>
        <h1 className="mt-3 text-headline">That page is outside the documented flow</h1>
        <p className="mt-4 text-body">
          Return to sign in or the dashboard to continue through the Smart Attendance admin journey.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/sign-in">
            <Button variant="secondary">Go to sign in</Button>
          </Link>
          <Link to="/app/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
