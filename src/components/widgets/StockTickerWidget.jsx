// StockTickerWidget.jsx — shows live stock prices via /api/stocks.
import React, { useState, useEffect } from 'react'

const DEFAULT_SYMBOLS = 'AAPL,GOOGL,MSFT'

export default function StockTickerWidget({ config, onChange }) {
  const [symbols, setSymbols] = useState(config.symbols || DEFAULT_SYMBOLS)
  const [inputVal, setInputVal] = useState(config.symbols || DEFAULT_SYMBOLS)
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => { fetchStocks(symbols) }, [symbols])

  async function fetchStocks(syms) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stocks?symbols=${encodeURIComponent(syms)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStocks(data.stocks)
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      setError('Could not load stock data.')
    }
    setLoading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const cleaned = inputVal.trim()
    setSymbols(cleaned)
    onChange({ symbols: cleaned })
  }

  return (
    <div>
      <form className="stock-form" onSubmit={handleSubmit}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="AAPL, GOOGL, MSFT"
        />
        <button type="submit" className="btn btn-secondary btn-sm" disabled={loading}>
          {loading ? '…' : '↺'}
        </button>
      </form>

      {error && <p style={{ color: '#e53e3e', fontSize: '0.82rem' }}>{error}</p>}

      <div className="stock-list">
        {stocks.map(s => (
          <div key={s.symbol} className="stock-row">
            {s.error ? (
              <span className="stock-symbol" style={{ color: '#a0aec0' }}>{s.symbol} — not found</span>
            ) : (
              <>
                <span className="stock-symbol">{s.symbol}</span>
                <span className="stock-price">${s.price?.toFixed(2)}</span>
                <span className={`stock-change ${s.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                  {s.change >= 0 ? '+' : ''}{s.change} ({s.changePct >= 0 ? '+' : ''}{s.changePct}%)
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {lastUpdated && (
        <div style={{ fontSize: '0.72rem', color: '#a0aec0', marginTop: '0.5rem' }}>
          Updated {lastUpdated}
        </div>
      )}
    </div>
  )
}
