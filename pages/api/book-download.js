import { sendTransactionalEmail, sendBookDownload } from '../../lib/mailchimp.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { to, name, bookTitle } = req.body || {}
    if (!to) return res.status(400).json({ error: 'Missing to' })

    const result = await sendBookDownload({ name, email: to }, bookTitle)
    return res.status(200).json({ success: true, provider: 'mandrill', result })
  } catch (e) {
    console.error('book-download error', e)
    return res.status(500).json({ error: e?.message || 'Internal error' })
  }
}


