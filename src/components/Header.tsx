import { Menu, Search, Video, Bell, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
}

export function Header({ onMenuClick, onSearch }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1">
            <Video size={28} className="text-red-600" />
            <span className="text-xl font-bold">ViewTube</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get('search') as string;
              onSearch(query);
            }}
            className="flex items-center"
          >
            <div className="flex-1 flex items-center">
              <input
                type="text"
                name="search"
                placeholder="Search"
                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="User profile">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
