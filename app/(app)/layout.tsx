import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let handle: string | undefined
  if (user) {
    const { data } = await supabase.from('profiles').select('handle').eq('id', user.id).single()
    handle = data?.handle ?? undefined
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav handle={handle} />
      <main className="flex-1 ml-16 min-h-screen">
        {children}
      </main>
    </div>
  )
}
