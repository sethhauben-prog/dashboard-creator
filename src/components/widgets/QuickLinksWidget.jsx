// QuickLinksWidget.jsx — lets the user save a list of frequently-visited URLs.
import React, { useState } from 'react'

export default function QuickLinksWidget({ config, onChange }) {
  const links = config.links || []
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)

  function addLink() {
    if (!url.trim()) return
    // Auto-add https:// if the user forgot it.
    const href = url.startsWith('http') ? url.trim() : `https://${url.trim()}`
    const name = label.trim() || href
    onChange({ links: [...links, { id: crypto.randomUUID(), label: name, url: href }] })
    setLabel('')
    setUrl('')
    setAdding(false)
  }

  function removeLink(id) {
    onChange({ links: links.filter(l => l.id !== id) })
  }

  return (
    <div>
      <ul className="links-list">
        {links.map(link => (
          <li key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
              🔗 {link.label}
            </a>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '0.9rem' }}
              onClick={() => removeLink(link.id)}
            >✕</button>
          </li>
        ))}
        {links.length === 0 && !adding && (
          <li style={{ color: '#a0aec0', fontSize: '0.85rem' }}>No links yet.</li>
        )}
      </ul>

      {adding ? (
        <div className="add-link-form">
          <input
            placeholder="Label (e.g. GitHub)"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <input
            placeholder="URL (e.g. github.com)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLink()}
          />
          <div className="link-btns">
            <button className="btn btn-primary btn-sm" onClick={addLink}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '0.75rem' }}
          onClick={() => setAdding(true)}
        >
          + Add Link
        </button>
      )}
    </div>
  )
}
