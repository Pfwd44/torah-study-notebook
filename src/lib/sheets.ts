import { PROXY_URL } from '../config'
import { Entry, Category } from './types'

const api = async (action: string, payload: any) => {
  const res = await fetch(`${PROXY_URL}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export const getEntries = async (): Promise<Entry[]> => {
  const data = await api('read', { sheet: 'Entries' })
  if (!data.values || data.values.length <= 1) return []
  return data.values.slice(1).map((r: any[]) => ({
    id: r[0],
    category: r[1],
    subcategory: r[2],
    content: r[3],
    references: r[4],
    tags: r[5]?.split(',').map((t: string) => t.trim()) || [],
    createdAt: r[6]
  }))
}

export const createEntry = async (e: Omit<Entry, 'id' | 'createdAt'>) => {
  const id = Date.now().toString()
  const row = [id, e.category, e.subcategory, e.content, e.references || '', e.tags.join(',')]
  await api('append', { sheet: 'Entries', values: [row] })
  return { ...e, id, createdAt: new Date().toISOString() }
}

export const getCategories = async (): Promise<Category[]> => {
  const data = await api('read', { sheet: 'Categories' })
  if (!data.values || data.values.length <= 1) return []
  return data.values.slice(1).map((r: any[]) => ({
    name: r[0],
    subcategories: r[1].split(',').map((s: string) => s.trim())
  }))
}

export const seedCategories = async () => {
  await api('seed', {})
}
