import React from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (newValue: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SearchBar({ query, onQueryChange, onSubmit }: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className='mb-8'>
      <input
        type='text'
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className='w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700'
        placeholder='Search for images...'
      />
    </form>
  );
}
