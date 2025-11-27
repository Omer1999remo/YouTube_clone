import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface MobileSearchProps {
  onSearch: (query: string) => void;
  onClose: () => void;
}

export function MobileSearch({ onSearch, onClose }: MobileSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            autoFocus
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
