import Image from 'next/image';
import { UnsplashImage } from '@/app/types/unsplash';

interface ImageGridProps {
  images: UnsplashImage[];
}

export function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {images.map((image, index) => (
        <div
          key={`${image.id}-${index}`}
          className={`relative aspect-square image-item ${index === images.length - 1 ? 'last-image' : ''}`}
        >
          <Image
            src={image.urls.regular}
            alt={image.alt_description || `Image by ${image.user.name}`}
            fill
            className='object-cover rounded transition-opacity hover:opacity-90'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            priority={index < 4}
          />
          <div className='absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm opacity-0 hover:opacity-100 transition-opacity'>
            Photo by {image.user.name}
          </div>
        </div>
      ))}
    </div>
  );
}
