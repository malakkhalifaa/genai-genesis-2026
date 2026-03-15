import { redirect } from 'next/navigation'
import { normalizePersona } from '@/lib/mockData'

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ persona?: string }>
}) {
  const params = await searchParams
  const persona = normalizePersona(params.persona)
  redirect(`/dashboard/analysis?persona=${persona}`)
}
