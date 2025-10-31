import { useState } from 'react'

export default function SefariaSearch({ onInsert }: { onInsert: (ref: string) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  const search = async () => {
    if (query.length < 3) { setResults([]); return }
    try {
      const res = await fetch(`https://www.sefaria.org/api/texts/${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [data])
    } catch (e) { setResults([]) }
  }

  return (
    <div style={{margin: '1rem 0', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '8px'}}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); search() }}
        placeholder="Search Sefaria (e.g., Genesis 1:1)"
        style={{width: '100%', padding: '0.5rem'}}
      />
      <div style={{maxHeight: '200px', overflowY: 'auto'}}>
        {results.map((r: any) => (
          <div
            key={r.ref}
            onClick={() => { onInsert(r.ref); setQuery(''); setResults([]) }}
            style={{padding: '0.5rem', borderBottom: '1px solid #eee', cursor: 'pointer'}}
          >
            <strong>{r.ref}</strong><br/>
            <span dir="rtl" style={{fontSize: '0.9rem'}}>{r.he?.join(' ')}</span><br/>
            <span style={{fontSize: '0.8rem', color: '#555'}}>{r.text?.join(' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
