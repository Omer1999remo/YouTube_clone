import { Home, TrendingUp, Clock, ThumbsUp, Film, Gamepad2, Newspaper, Trophy, Lightbulb, Music } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const mainLinks = [
    { icon: Home, label: 'Home', active: true },
    { icon: TrendingUp, label: 'Trending' },
    { icon: Clock, label: 'History' },
    { icon: ThumbsUp, label: 'Liked Videos' },
  ];

  const categories = [
    { icon: Music, label: 'Music' },
    { icon: Gamepad2, label: 'Gaming' },
    { icon: Newspaper, label: 'News' },
    { icon: Trophy, label: 'Sports' },
    { icon: Lightbulb, label: 'Learning' },
    { icon: Film, label: 'Movies' },
  ];

  return (
    <>
      <aside
        className={`fixed top-14 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto hidden md:block ${
          isOpen ? 'w-60' : 'w-20'
        }`}
      >
        <nav className="py-3">
          <div className="mb-3">
            {mainLinks.map((link) => (
              <button
                key={link.label}
                className={`w-full flex items-center gap-6 px-6 py-3 hover:bg-gray-100 transition-colors ${
                  link.active ? 'bg-gray-100' : ''
                }`}
              >
                <link.icon size={20} />
                {isOpen && <span className="text-sm font-medium">{link.label}</span>}
              </button>
            ))}
          </div>

          {isOpen && (
            <>
              <div className="border-t border-gray-200 my-3"></div>
              <div className="mb-3">
                <h3 className="px-6 py-2 text-xs font-semibold text-gray-600 uppercase">Explore</h3>
                {categories.map((category) => (
                  <button
                    key={category.label}
                    className="w-full flex items-center gap-6 px-6 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <category.icon size={20} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
