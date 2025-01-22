import { searchPhotos, fetchPhotos } from '../api';

describe('searchPhotos', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY = 'test-api-key';
  });

  it('throws error when API key is missing', async () => {
    // Clear the API key
    delete process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

    // Mock fetch to ensure it's not called
    mockFetch.mockImplementation(() => {
      throw new Error('Fetch should not be called');
    });

    // Test fetchPhotos directly since it handles the API key check
    await expect(fetchPhotos('test', 1)).rejects.toThrow('Unsplash API key is not configured');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches photos from the API', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total: 0,
          total_pages: 0
        })
    };
    mockFetch.mockResolvedValue(mockResponse);

    await searchPhotos('test', 1);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.unsplash.com/search/photos'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Client-ID test-api-key'
        })
      })
    );
  });

  it('uses cached data when available', async () => {
    const mockResponse = {
      results: [{ id: '1' }],
      total: 1,
      total_pages: 1
    };

    localStorage.setItem(
      'unsplash_test_1',
      JSON.stringify({
        data: mockResponse,
        timestamp: Date.now()
      })
    );

    const result = await searchPhotos('test', 1);
    expect(result).toEqual(mockResponse);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches new data when cache is expired', async () => {
    const mockResponse = {
      results: [{ id: '1' }],
      total: 1,
      total_pages: 1
    };

    localStorage.setItem(
      'unsplash_test_1',
      JSON.stringify({
        data: mockResponse,
        timestamp: Date.now() - 3600001 // More than 1 hour old
      })
    );

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    await searchPhotos('test', 1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
