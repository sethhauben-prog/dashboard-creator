// api/claude.js — Vercel serverless function.
// This runs on the server so the ANTHROPIC_API_KEY is never sent to the browser.
import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  // Only allow POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  try {
    // The API key lives only here on the server — never in the frontend.
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      // A short system prompt to keep answers focused and concise.
      system: 'You are a helpful assistant embedded in a personal dashboard. Keep responses clear and concise.',
      messages,
    })

    res.status(200).json({ reply: response.content[0].text })
  } catch (err) {
    console.error('Claude API error:', err)
    res.status(500).json({ error: 'Failed to get a response from Claude.' })
  }
}
