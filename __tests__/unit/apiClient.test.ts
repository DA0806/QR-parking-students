import { apiClient } from '../../config/apiClient';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/test');
      expect(result).toEqual(mockData);
    });

    it('should throw error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Not found');
    });
  });

  describe('post', () => {
    it('should post data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      const body = { name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await apiClient.post('/test', body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      expect(result).toEqual(mockData);
    });

    it('should throw error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' })
      });

      await expect(apiClient.post('/test', {})).rejects.toThrow('Bad request');
    });
  });

  describe('delete', () => {
    it('should delete data successfully', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await apiClient.delete('/test/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test/1',
        { method: 'DELETE' }
      );
      expect(result).toEqual(mockData);
    });
  });
});
