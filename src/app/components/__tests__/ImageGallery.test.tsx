import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageGallery from '../ImageGallery';
import { searchPhotos } from '@/app/lib/api';

jest.mock('@/app/lib/api');

interface MockImageResponse {
  results: Array<{
    id: string;
    urls: { regular: string };
    alt_description: string;
    user: { name: string };
  }>;
  total: number;
  total_pages: number;
}

const mockImages: MockImageResponse = {
  results: [
    {
      id: '1',
      urls: { regular: 'https://example.com/image1.jpg' },
      alt_description: 'Test image 1',
      user: { name: 'Test User 1' }
    },
    {
      id: '2',
      urls: { regular: 'https://example.com/image2.jpg' },
      alt_description: 'Test image 2',
      user: { name: 'Test User 2' }
    }
  ],
  total: 2,
  total_pages: 1
};

describe('ImageGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (searchPhotos as jest.Mock).mockResolvedValue(mockImages);
  });

  it('renders the search input', async () => {
    render(<ImageGallery initialQuery='sports' />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search for images...')).toBeInTheDocument();
    });
  });

  it('loads images on mount', async () => {
    (searchPhotos as jest.Mock).mockResolvedValue(mockImages);
    render(<ImageGallery initialQuery='sports' />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const images = screen.getAllByAltText(/Test image/);
      expect(images).toHaveLength(2);
    });

    expect(searchPhotos).toHaveBeenCalledWith('sports', 1);
  });

  it('updates search query', async () => {
    (searchPhotos as jest.Mock).mockResolvedValue({
      results: [],
      total: 0,
      total_pages: 0
    });

    render(<ImageGallery initialQuery='sports' />);

    const input = screen.getByPlaceholderText('Search for images...');
    fireEvent.change(input, { target: { value: 'nature' } });

    await waitFor(() => {
      expect(input).toHaveValue('nature');
      expect(searchPhotos).toHaveBeenCalledWith('nature', 1);
    });
  });

  it('displays error message when API fails', async () => {
    const origError = console.error;
    console.error = jest.fn(); // suppress for this test

    (searchPhotos as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    render(<ImageGallery initialQuery='sports' />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load images/i)).toBeInTheDocument();
    });

    console.error = origError; // restore
  });

  it('shows loading state', async () => {
    let resolvePromise!: (value: MockImageResponse) => void;
    const loadingPromise = new Promise<MockImageResponse>((resolve) => {
      resolvePromise = resolve;
    });

    (searchPhotos as jest.Mock).mockImplementationOnce(() => loadingPromise);
    render(<ImageGallery initialQuery='sports' />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    resolvePromise(mockImages);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const images = screen.getAllByAltText(/Test image/);
    expect(images).toHaveLength(2);
  });

  it('does not call API when search query is empty', async () => {
    // Start with empty query
    render(<ImageGallery initialQuery='' />);

    const input = screen.getByPlaceholderText('Search for images...');
    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    expect(searchPhotos).not.toHaveBeenCalled();
  });
});
