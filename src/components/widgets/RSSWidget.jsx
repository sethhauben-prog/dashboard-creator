// RSSWidget.jsx — fetches and displays headlines from any RSS feed.
// We use the free rss2json API to convert RSS XML into JSON.
import React, { useState, useEffect } from 'react'

const DEFAULT_FEED = 'https://feeds.bbci.co.uk/news/rss.xml'

export default function RSSWidget({ config, onChange }) {
  const [feedUrl, setFeedUrl] = useState(config.feedUrl || DEFAULT_FEED)
  const [inputUrl, setInputUrl] = useState(config.feedUrl || DEFAULT_FEED)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load feed on mount or when feedUrl changes.
  useEffect(() => {
    fetchFeed(feedUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedUrl])

  async function fetchFeed(url) {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=8`
      const res = await fetch(apiUrl)
      const data = await res.json()

      if (data.status !== 'ok') {
        setError('Could not load this feed. Check the URL.')
        setItems([])
      } else {
        setItems(data.items || [])
      }
    } catch (err) {
      setError('Network error loading feed.')
      setItems([])
    }
    setLoading(false)
  }

  function handleGoFeed(e) {
    e.preventDefault()
    setFeedUrl(inputUrl.trim())
    onChange({ feedUrl: inputUrl.trim() })
  }

  return (
    <div>
      <form className="rss-feed-form" onSubmit={handleGoFeed}>
        <input
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          placeholder="RSS feed URL…"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? '…' : 'Load'}
        </button>
      </form>

      {error && <p style={{ color: '#e53e3e', fontSize: '0.82rem' }}>{error}</p>}

      <ul className="rss-items">
        {items.map((item, i) => (
          <li key={i} className="rss-item">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </li>
        ))}
        {!loading && !error && items.length === 0 && (
          <li style={{ color: '#a0aec0', fontSize: '0.85rem' }}>No items found.</li>
        )}
      </ul>
    </div>
  )
}
