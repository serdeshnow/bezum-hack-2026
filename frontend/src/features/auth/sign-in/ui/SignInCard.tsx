import { useState } from 'react'
import { useNavigate } from 'react-router'

import { appRoutes } from '@/shared/model'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/shared/ui'

import { useStubSignIn } from '../model/useStubSignIn.ts'

const quickUsers = [
  { email: 'alex@seamless.dev', label: 'Developer' },
  { email: 'emily@client.dev', label: 'Customer' }
] as const

export function SignInCard() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('sarah@seamless.dev')
  const [apiToken, setApiToken] = useState('')
  const signIn = useStubSignIn()

  const submit = (value: string) => {
    signIn.mutate({ email: value, apiToken: apiToken.trim() || undefined }, {
      onSuccess: () => navigate(appRoutes.auth.verify)
    })
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Frontend auth shell uses env + localStorage. If backend auth is required, provide a bearer token below.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder='sarah@seamless.dev' />
        <Input value={apiToken} onChange={(event) => setApiToken(event.target.value)} placeholder='Optional bearer token for backend API' />
        <Button className='w-full' onClick={() => submit(email)} disabled={signIn.isPending}>
          Continue
        </Button>
        <div className='grid gap-2 sm:grid-cols-2'>
          {quickUsers.map((user) => (
            <Button key={user.email} variant='outline' onClick={() => submit(user.email)} disabled={signIn.isPending}>
              {user.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
