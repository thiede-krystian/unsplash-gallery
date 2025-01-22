'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UnsplashImage } from '@/app/types/unsplash';
import { searchPhotos } from '@/app/lib/api';
import { useDebounce } from '@/app/hooks/useDebounce';
import { SearchBar } from './SearchBar';
import { ImageGrid } from './ImageGrid';

interface ImageGalleryProps {
  initialQuery: string;
}

export default function ImageGallery({ initialQuery }: ImageGalleryProps) {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const actualDelay = process.env.NODE_ENV === 'test' ? 0 : 500;
  const debouncedQuery = useDebounce(query, actualDelay);

  const lastUsedQueryRef = useRef(initialQuery);

  const loadImages = useCallback(
    async (reset = false) => {
      if (loading || (!hasMore && !reset) || debouncedQuery.trim() === '') {
        /* console.log(
          'Skipping loadImages. loading =',
          loading,
          'hasMore =',
          hasMore,
          'debouncedQuery =',
          debouncedQuery
        ); */
        return;
      }

      const currentPage = reset ? 1 : page;

      try {
        setLoading(true);
        setError(null);

        const data = await searchPhotos(debouncedQuery, currentPage);

        setImages((prev) => {
          if (reset) {
            return data.results;
          }
          // Prevent duplicate images when multiple loads trigger
          const existingIds = new Set(prev.map((img) => img.id));
          const uniqueNewImages = data.results.filter((img) => !existingIds.has(img.id));
          return [...prev, ...uniqueNewImages];
        });

        setHasMore(currentPage < data.total_pages);

        if (!reset && currentPage === page) {
          setPage((p) => p + 1);
        }
      } catch (err) {
        console.error('Error loading images:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, page, loading, hasMore]
  );

  useEffect(() => {
    if (initialQuery.trim()) {
      /* console.log('Initial load triggered'); */
      loadImages(true);
    }
  }, []);

  useEffect(() => {
    const current = debouncedQuery.trim();
    const previous = lastUsedQueryRef.current.trim();

    if (!current) {
      /* console.log('Skipping loadImages due to empty query'); */
      setImages([]);
      return;
    }

    // Only reset if this is an actual new query
    if (current !== previous) {
      /* console.log('New query detected, resetting and loading images'); */
      lastUsedQueryRef.current = current;
      setPage(1); // Explicitly reset page
      loadImages(true);
    }
  }, [debouncedQuery, loadImages]);

  // Infinite scroll effect
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(
          'Observer triggered:',
          '\nisIntersecting:',
          entry.isIntersecting,
          '\nloading:',
          loading,
          '\nhasMore:',
          hasMore,
          '\ncurrent page:',
          page,
          '\ntotal images:',
          images.length
        );
        if (entry.isIntersecting && hasMore && !loading) {
          /* console.log('Loading more images...'); */
          loadImages(false);
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0
      }
    );

    // Use a small delay to let the DOM update
    const timeoutId = setTimeout(() => {
      const lastImageElement = document.querySelector('.image-item.last-image');
      if (lastImageElement) {
        observer.observe(lastImageElement);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [images.length, hasMore, loading, loadImages, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadImages(true);
  };

  const handleQueryChange = (newValue: string) => {
    setQuery(newValue);
  };

  return (
    <div className='container mx-auto px-4'>
      <SearchBar query={query} onQueryChange={handleQueryChange} onSubmit={handleSearchSubmit} />

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:text-red-100'>
          {error}
        </div>
      )}

      <ImageGrid images={images} />

      {loading && (
        <div className='text-center py-4'>
          <div
            data-testid='loading-spinner'
            className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]'
          />
        </div>
      )}

      {/* Debug info */}
      <div className='text-xs text-gray-500 mt-4 text-center'>
        Page {page} | Total Images: {images.length} | Has More: {hasMore.toString()}
      </div>
    </div>
  );
}
