import { Card } from '@/shared/ui'

export function SignInPlaceholderPage() {
  return (
    <div className='flex justify-center'>
      <Card>
        <Card.Container className='grid max-w-[56ch] gap-3'>
          <p>Optional Auth Module</p>
          <h1>Sign-in route placeholder</h1>
          <p className='m-0 text-slate-600'>
            The template can expose auth routes when `VITE_FEATURE_AUTH=true`, but the actual authentication flow is
            expected to be replaced by the target project or by an example pack.
          </p>
        </Card.Container>
      </Card>
    </div>
  )
}
