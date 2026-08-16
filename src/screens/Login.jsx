import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Login / Sign up — gates nothing yet in this demo. Toggle between
// email+password and phone+OTP; both submit as a no-op straight to Home.

export function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('email') // 'email' | 'phone'
  const [otpSent, setOtpSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Static vignette + grain texture — no animation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(20,23,31,0) 0%, rgba(11,13,18,0.85) 75%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-tight">
            Cine<span className="text-accent-marquee">House</span>
          </h1>
          <p className="text-sm text-text-secondary mt-2">Book your seat, dim the lights.</p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border-subtle p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('email')
                setOtpSent(false)
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors min-h-[36px]
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee
                ${mode === 'email' ? 'bg-accent-marquee text-bg-base' : 'text-text-secondary'}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('phone')
                setOtpSent(false)
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors min-h-[36px]
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee
                ${mode === 'phone' ? 'bg-accent-marquee text-bg-base' : 'text-text-secondary'}`}
            >
              Phone + OTP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'email' ? (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-text-secondary">Email</span>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="rounded-lg bg-surface-raised border border-border-subtle px-3 py-2.5 min-h-[44px]
                      text-sm text-text-primary placeholder:text-text-secondary
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-text-secondary">Password</span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="rounded-lg bg-surface-raised border border-border-subtle px-3 py-2.5 min-h-[44px]
                      text-sm text-text-primary placeholder:text-text-secondary
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-text-secondary">Phone number</span>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="rounded-lg bg-surface-raised border border-border-subtle px-3 py-2.5 min-h-[44px]
                      text-sm text-text-primary placeholder:text-text-secondary
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
                  />
                </label>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="rounded-lg border border-accent-marquee text-accent-marquee py-2.5 min-h-[44px] text-sm font-medium
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
                  >
                    Send OTP
                  </button>
                ) : (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-text-secondary">Enter OTP</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="6-digit code"
                      className="rounded-lg bg-surface-raised border border-border-subtle px-3 py-2.5 min-h-[44px]
                        font-mono text-sm text-text-primary placeholder:text-text-secondary tracking-widest
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
                    />
                  </label>
                )}
              </>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-accent-marquee text-bg-base font-medium py-3.5 min-h-[44px]
                hover:bg-accent-marquee/90 active:scale-[0.99] transition-colors
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
            >
              Continue
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-center text-sm text-text-secondary mt-4 py-2
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee rounded-lg"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
