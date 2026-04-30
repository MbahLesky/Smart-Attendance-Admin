import { toast } from 'sonner'

import { Button } from '../../../components/ui/button'

export function SocialAuthButtons() {
  return (
    <div className="space-y-3">
      <Button
        fullWidth
        variant="secondary"
        type="button"
        onClick={() => toast.info('Google login is not active')}
      >
        Continue with Google
      </Button>
      <Button
        fullWidth
        variant="secondary"
        type="button"
        onClick={() => toast.info('Company login will be added later')}
      >
        Continue with SSO
      </Button>
    </div>
  )
}
