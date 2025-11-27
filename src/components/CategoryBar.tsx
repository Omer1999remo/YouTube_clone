import { useState } from 'react';

interface Category {
  id: string;
  label: string;
}

const categories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'news', label: 'News' },
  { id: 'sports', label: 'Sports' },
  { id: 'learning', label: 'Learning' },
  { id: 'movies', label: 'Movies' },
  { id: 'tech', label: 'Technology' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'travel', label: 'Travel' },
];

interface CategoryBarProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryBar({ onCategoryChange }: CategoryBarProps) {
  const [selected, setSelected] = useState('all');

  const handleClick = (id: string) => {
    setSelected(id);
    onCategoryChange?.(id);
  };

  return (
    <div className="sticky top-14 bg-white border-b border-gray-200 z-30 overflow-x-auto">
      <div className="flex gap-3 px-6 py-3 min-w-max">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selected === category.id
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
