'use client'
import { signInWithGoogle } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        padding: 40,
      }}
    >
      <h1 style={{ fontSize: '24px', marginBottom: 12 }}>
        EggPuff 🥐
      </h1>

      <button
  onClick={signInWithGoogle}
  style={{
    width: '260px',
    textAlign: 'center',
    marginTop: '12px',
  }}
>
  Continue with Google
</button>

    </div>
  )
}
