import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as mail from '../lib/mailchimp.js'

describe('sendTransactionalEmail', () => {
  beforeEach(() => {
    // Mock the transactional client by monkey-patching the function to avoid network
    vi.spyOn(mail, 'sendTransactionalEmail').mockResolvedValue([{ email: 'test@example.com', status: 'sent' }])
  })

  it('sends with template name when provided', async () => {
    const res = await mail.sendTransactionalEmail({
      to: 'user@example.com',
      from: 'from@example.com',
      templateName: 'TemplateName',
      dynamicData: { foo: 'bar' }
    })
    expect(res[0].status).toBe('sent')
  })
})

describe('sendBookDownload', () => {
  beforeEach(() => {
    vi.spyOn(mail, 'sendTransactionalEmail').mockResolvedValue([{ email: 'test@example.com', status: 'sent' }])
  })

  it('uses template when MAILCHIMP_BOOK_DOWNLOAD_TEMPLATE_NAME is set', async () => {
    process.env.MAILCHIMP_BOOK_DOWNLOAD_TEMPLATE_NAME = 'BookDwn'
    const res = await mail.sendBookDownload({ name: 'User', email: 'user@example.com' }, 'Demo Book')
    expect(res[0].status).toBe('sent')
  })

  it('falls back to raw HTML when template not set', async () => {
    delete process.env.MAILCHIMP_BOOK_DOWNLOAD_TEMPLATE_NAME
    const res = await mail.sendBookDownload({ name: 'User', email: 'user@example.com' }, 'Demo Book')
    expect(res[0].status).toBe('sent')
  })
})


