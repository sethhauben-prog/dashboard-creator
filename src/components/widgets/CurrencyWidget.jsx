// CurrencyWidget.jsx — displays live currency exchange rates using the free Frankfurter API.
import React, { useState, useEffect } from 'react'

const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'INR']

export default function CurrencyWidget({ config, onChange }) {
  const [base, setBase] = useState(config.base || 'USD')
  const [targets, setTargets] = useState(config.targets || ['EUR', 'GBP', 'JPY'])
  const [rates, setRates] = useState(config.rates || null)
  const [amount, setAmount] = useState(config.amount || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch rates when the component mounts or when base currency changes.
  useEffect(() => {
    fetchRates(base)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])

  async function fetchRates(baseCurrency) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`)
      const data = await res.json()
      setRates(data.rates)
      onChange({ base: baseCurrency, rates: data.rates, targets, amount })
    } catch (err) {
      setError('Could not load rates.')
    }
    setLoading(false)
  }

  function handleBaseChange(e) {
    const newBase = e.target.value
    setBase(newBase)
    onChange({ base: newBase, rates, targets, amount })
  }

  function handleAmountChange(e) {
    const val = parseFloat(e.target.value) || 1
    setAmount(val)
    onChange({ base, rates, targets, amount: val })
  }

  return (
    <div>
      <div className="currency-controls">
        <input
          type="number"
          min="0.01"
          step="any"
          value={amount}
          onChange={handleAmountChange}
          style={{ width: '80px' }}
        />
        <select value={base} onChange={handleBaseChange}>
          {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fetchRates(base)}
          disabled={loading}
        >
          {loading ? '…' : '↺ Refresh'}
        </button>
      </div>

      {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem' }}>{error}</p>}

      {rates && (
        <div className="currency-display">
          {targets.map(currency => {
            if (!rates[currency]) return null
            return (
              <div key={currency} className="currency-rate-row">
                <span className="currency-pair">{base} → {currency}</span>
                <span className="currency-value">
                  {(rates[currency] * amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {!rates && !loading && !error && (
        <p style={{ color: '#a0aec0', fontSize: '0.85rem' }}>Loading exchange rates…</p>
      )}
    </div>
  )
}
