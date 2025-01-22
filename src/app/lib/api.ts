import { UnsplashResponse } from '../types/unsplash';

const CACHE_DURATION = 3600;

export async function searchPhotos(query: string, page: number = 1): Promise<UnsplashResponse> {
  if (typeof window === 'undefined') {
    return fetchPhotos(query, page);
  }

  // Try to get from localStorage first
  const cacheKey = `unsplash_${query}_${page}`;
  try {
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION * 1000) {
        return data;
      }
    }

    const data = await fetchPhotos(query, page);

    // Cache the response
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );

    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fetchPhotos(query, page);
  }
}

export async function fetchPhotos(query: string, page: number): Promise<UnsplashResponse> {
  const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('Unsplash API key is not configured');
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.statusText}`);
  }

  return response.json();
}
