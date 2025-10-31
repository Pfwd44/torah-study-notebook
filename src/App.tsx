import { useState, useEffect } from 'react'
import { getEntries, createEntry, getCategories, seedCategories } from './lib/sheets'
import SefariaSearch from './components/SefariaSearch'
import { Entry, Category } from './lib/types'

export default function App() {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [entries, setEntries] = useState<Entry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      let cats = await getCategories()
      if (cats.length === 0) {
        await seedCategories()
        cats = await getCategories()
      }
      const ents = await getEntries()
      setCategories(cats)
      setEntries(ents)
    } catch (e) {
      alert('Error: Check your proxy URL')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const entry = {
      category: form.category.value,
      subcategory: form.subcategory.value,
      content: form.content.value,
      references: form.references.value,
      tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean)
    }
    const newEntry = await createEntry(entry)
    setEntries([newEntry, ...entries])
    form.reset()
    setView('list')
  }

  if (loading) return <div style={{textAlign:'center', padding:'3rem'}}>Loading your Torah Notebook...</div>

  return (
    <div>
      <header style={{textAlign:'center', marginBottom:'2rem'}}>
        <h1>Torah Study Notebook</h1>
        <nav>
          <button onClick={() => setView('list')}>Entries</button>
          <button onClick={() => setView('form')}>New Entry</button>
        </nav>
      </header>

      {view === 'list' && (
        <div>
          {entries.length === 0 ? <p>No entries yet. Create one!</p> : null}
          {entries.map(e => (
            <div key={e.id} className="entry">
              <h3>{e.category} → {e.subcategory}</h3>
              <p className={/[\u0590-\u05FF]/.test(e.content) ? 'hebrew' : ''}>{e.content}</p>
              {e.references && <p><a href={`https://sefaria.org/${e.references}`} target="_blank">Source on Sefaria</a></p>}
              <div>{e.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'form' && (
        <form onSubmit={handleSubmit}>
          <select name="category" required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.name}>{c.name}</option>)}
          </select>

          <select name="subcategory" required>
            <option value="">Select Subcategory</option>
            {categories.find(c => c.name === (document.querySelector('[name=category]') as HTMLSelectElement)?.value)?.subcategories.map(s => 
              <option key={s}>{s}</option>
            )}
          </select>

          <textarea name="content" placeholder="Your Torah insight (Hebrew OK)" required />
          <input name="references" placeholder="Reference (e.g., Genesis 1:1)" />
          <SefariaSearch onInsert={ref => {(document.querySelector('[name=references]') as HTMLInputElement).value = ref}} />
          <input name="tags" placeholder="Tags: rashi, chiddush, question" />
          <button type="submit">Save Entry</button>
        </form>
      )}
    </div>
  )
}
