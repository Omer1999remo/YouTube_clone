import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoGrid } from './components/VideoGrid';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryBar } from './components/CategoryBar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { MobileSearch } from './components/MobileSearch';
import { supabase, Video } from './lib/supabase';

type VideoWithChannel = Video & {
  channels: {
    name: string;
    avatar_url: string;
    handle: string;
    subscriber_count: number;
  };
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoWithChannel[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.channels.name.toLowerCase().includes(query)
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, handle, subscriber_count)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Failed to load videos. Please try again.');
      setLoading(false);
      return;
    }

    if (data) {
      setVideos(data as VideoWithChannel[]);
      setFilteredVideos(data as VideoWithChannel[]);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedVideo(null);
  };

  const handleVideoClick = (video: VideoWithChannel) => {
    setSelectedVideo(video);
  };

  const handleBack = () => {
    setSelectedVideo(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedVideo(null);
  };

  const handleMobileSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={handleSearch}
        onMobileSearchClick={() => setShowMobileSearch(true)}
      />
      <Sidebar isOpen={sidebarOpen} />

      {showMobileSearch && (
        <MobileSearch
          onSearch={handleMobileSearch}
          onClose={() => setShowMobileSearch(false)}
        />
      )}

      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-60' : 'md:ml-20'
        } ml-0`}
      >
        {!selectedVideo && <CategoryBar onCategoryChange={handleCategoryChange} />}

        <div className="p-6">
          {loading ? (
            <LoadingSpinner size="lg" message="Loading videos..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={loadVideos} />
          ) : selectedVideo ? (
            <VideoPlayer
              video={selectedVideo}
              onBack={handleBack}
              relatedVideos={videos.filter(v => v.id !== selectedVideo.id).slice(0, 10)}
              onVideoClick={handleVideoClick}
            />
          ) : filteredVideos.length > 0 ? (
            <>
              {searchQuery && (
                <h2 className="text-xl font-bold mb-4">
                  Search results for "{searchQuery}"
                </h2>
              )}
              <VideoGrid videos={filteredVideos} onVideoClick={handleVideoClick} />
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">No videos found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
