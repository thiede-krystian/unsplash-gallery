# Unsplash Gallery

A Next.js application that displays images from Unsplash based on search terms.

## Features

- Image gallery with infinite scroll
- Dynamic search functionality
- Responsive grid layout
- Error handling
- Local storage caching
- Automated tests

## Technical Decisions

- **Next.js 15**: Chosen for its built-in performance optimizations and server-side rendering capabilities
- **TypeScript**: Provides type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Intersection Observer**: Used for implementing infinite scroll
- **Local Storage**: Implements caching to reduce API calls
- **Jest & React Testing Library**: For component testing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your Unsplash API key:
   ```
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Running Tests

```bash
npm run test
```
