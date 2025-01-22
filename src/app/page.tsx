import ImageGallery from './components/ImageGallery';

export default function Home() {
  return (
    <main className='min-h-screen p-4'>
      <h1 className='text-3xl font-bold text-center mb-8'>Unsplash Image Gallery</h1>
      <ImageGallery initialQuery='sports' />
    </main>
  );
}
