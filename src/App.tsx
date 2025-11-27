import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoGrid } from './components/VideoGrid';
import { VideoPlayer } from './components/VideoPlayer';
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
    const { data, error } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, handle, subscriber_count)')
      .order('created_at', { ascending: false });

    if (data && !error) {
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

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearch={handleSearch} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-60' : 'md:ml-20'
        } ml-0`}
      >
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Loading videos...</p>
            </div>
          ) : selectedVideo ? (
            <VideoPlayer video={selectedVideo} onBack={handleBack} />
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
