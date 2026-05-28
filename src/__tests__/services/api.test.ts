import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../../services/api'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

function mockOk(data: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  })
}

function mockError(status: number, detail = 'Something went wrong') {
  fetchMock.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: detail,
    json: () => Promise.resolve({ detail }),
  })
}

describe('API client', () => {
  beforeEach(() => fetchMock.mockClear())

  // ── Upload ────────────────────────────────────────────────────────────────

  describe('upload.climatic', () => {
    it('posts to /api/upload/climatic and returns a file_id', async () => {
      mockOk({ file_id: 'climate-abc' })
      const result = await api.upload.climatic(new File(['data'], 'climate.csv'))
      expect(result.file_id).toBe('climate-abc')
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/upload/climatic'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('upload.genetic', () => {
    it('posts to /api/upload/genetic and returns a file_id', async () => {
      mockOk({ file_id: 'genetic-xyz' })
      const result = await api.upload.genetic(new File(['>seq\nATGC'], 'seqs.fasta'))
      expect(result.file_id).toBe('genetic-xyz')
    })
  })

  // ── Jobs ──────────────────────────────────────────────────────────────────

  describe('jobs.create', () => {
    it('posts to /api/jobs and returns a result_id', async () => {
      mockOk({ result_id: 'job-001' })
      const result = await api.jobs.create({ climatic_file_id: 'climate-abc' })
      expect(result.result_id).toBe('job-001')
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/jobs'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('jobs.status', () => {
    it('fetches job status and progress', async () => {
      mockOk({ status: 'alignment', progress: 40 })
      const status = await api.jobs.status('job-001')
      expect(status.status).toBe('alignment')
      expect(status.progress).toBe(40)
    })

    it('returns complete status at 100% progress', async () => {
      mockOk({ status: 'complete', progress: 100 })
      const status = await api.jobs.status('job-001')
      expect(status.status).toBe('complete')
      expect(status.progress).toBe(100)
    })
  })

  // ── Results ───────────────────────────────────────────────────────────────

  describe('results.list', () => {
    it('fetches and returns an array of results', async () => {
      mockOk([{ _id: '1', name: 'Run A' }, { _id: '2', name: 'Run B' }])
      const list = await api.results.list()
      expect(list).toHaveLength(2)
      expect(list[0]._id).toBe('1')
      expect(list[1].name).toBe('Run B')
    })

    it('returns an empty array when no results exist', async () => {
      mockOk([])
      const list = await api.results.list()
      expect(list).toHaveLength(0)
    })
  })

  describe('results.get', () => {
    it('fetches a single result by ID', async () => {
      mockOk({ _id: 'r1', name: 'Run 1', status: 'complete' })
      const result = await api.results.get('r1')
      expect(result._id).toBe('r1')
      expect(result.status).toBe('complete')
    })
  })

  describe('results.delete', () => {
    it('sends a DELETE request and returns confirmation', async () => {
      mockOk({ message: 'Deleted' })
      const res = await api.results.delete('r1')
      expect(res.message).toBe('Deleted')
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/results/r1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })

  describe('results.download', () => {
    it('returns a Blob for the XLSX download', async () => {
      mockOk({ data: 'binary' })
      const blob = await api.results.download('r1')
      expect(blob).toBeInstanceOf(Blob)
    })
  })

  describe('results.email', () => {
    it('posts to the email endpoint', async () => {
      mockOk({ message: 'Email sent' })
      const res = await api.results.email('r1', 'user@example.com')
      expect(res.message).toBe('Email sent')
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/results/r1/email'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  // ── Settings ──────────────────────────────────────────────────────────────

  describe('settings.get', () => {
    it('fetches and returns the settings object', async () => {
      mockOk({ bootstrap_threshold: 10, window_size: 400 })
      const s = await api.settings.get()
      expect(s['bootstrap_threshold']).toBe(10)
      expect(s['window_size']).toBe(400)
    })
  })

  describe('settings.update', () => {
    it('sends a PUT request with the updated settings', async () => {
      mockOk({ bootstrap_threshold: 25 })
      const s = await api.settings.update({ bootstrap_threshold: 25 })
      expect(s['bootstrap_threshold']).toBe(25)
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/settings'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  // ── Error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws with the backend detail message on 404', async () => {
      mockError(404, 'Not found')
      await expect(api.results.get('missing')).rejects.toThrow('Not found')
    })

    it('throws on 500 server errors', async () => {
      mockError(500, 'Internal server error')
      await expect(api.results.list()).rejects.toThrow('Internal server error')
    })

    it('throws on failed job creation', async () => {
      mockError(422, 'Validation error')
      await expect(api.jobs.create({ climatic_file_id: '' })).rejects.toThrow('Validation error')
    })
  })
})
