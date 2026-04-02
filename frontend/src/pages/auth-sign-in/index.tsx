import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'

import { sessionService } from '@/entities/session'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/shared/ui'

export function AuthSignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('sarah@seamless.dev')
  const signIn = useMutation({
    mutationFn: (value: string) => sessionService.signIn(value),
    onSuccess: () => navigate('/auth/verify')
  })

  return (
    <div className='flex min-h-screen items-center justify-center px-6 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Frontend auth shell is backed by env + localStorage until backend auth endpoints are introduced.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder='sarah@seamless.dev' />
          <Button className='w-full' onClick={() => signIn.mutate(email)}>Continue</Button>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Button variant='outline' onClick={() => signIn.mutate('alex@seamless.dev')}>Developer</Button>
            <Button variant='outline' onClick={() => signIn.mutate('emily@client.dev')}>Customer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
