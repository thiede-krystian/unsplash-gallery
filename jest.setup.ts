import '@testing-library/jest-dom';

const mockIntersectionObserver = jest.fn(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
}));

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver
});
