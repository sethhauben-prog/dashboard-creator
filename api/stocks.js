// api/stocks.js — proxies Yahoo Finance requests to avoid browser CORS restrictions.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { symbols } = req.query
  if (!symbols) return res.status(400).json({ error: 'symbols query param required' })

  const symbolList = symbols.split(',').map(s => s.trim().toUpperCase()).slice(0, 6)

  try {
    const results = await Promise.all(
      symbolList.map(async symbol => {
        try {
          const r = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          )
          const data = await r.json()
          const meta = data?.chart?.result?.[0]?.meta
          if (!meta) return { symbol, error: 'Not found' }

          const change = meta.regularMarketPrice - meta.chartPreviousClose
          const changePct = (change / meta.chartPreviousClose) * 100

          return {
            symbol,
            price: meta.regularMarketPrice,
            change: parseFloat(change.toFixed(2)),
            changePct: parseFloat(changePct.toFixed(2)),
          }
        } catch {
          return { symbol, error: 'Failed' }
        }
      })
    )

    res.status(200).json({ stocks: results })
  } catch (err) {
    console.error('Stocks error:', err)
    res.status(500).json({ error: 'Failed to fetch stock data' })
  }
}
