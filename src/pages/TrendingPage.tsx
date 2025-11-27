import { useState, useEffect } from 'react';
import { Video, supabase } from '../lib/supabase';
import { VideoGrid } from '../components/VideoGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { TrendingUp } from 'lucide-react';

type VideoWithChannel = Video & {
  channels: {
    name: string;
    avatar_url: string;
    handle: string;
    subscriber_count: number;
  };
};

interface TrendingPageProps {
  onVideoClick: (video: VideoWithChannel) => void;
}

export function TrendingPage({ onVideoClick }: TrendingPageProps) {
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  useEffect(() => {
    loadTrendingVideos();
  }, [timeFilter]);

  const loadTrendingVideos = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('videos')
      .select('*, channels(name, avatar_url, handle, subscriber_count)')
      .order('view_count', { ascending: false })
      .limit(50);

    const now = new Date();
    let cutoffDate: Date;

    switch (timeFilter) {
      case 'today':
        cutoffDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        cutoffDate = new Date(0);
    }

    if (timeFilter !== 'all') {
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError('Failed to load trending videos. Please try again.');
      setLoading(false);
      return;
    }

    if (data) {
      setVideos(data as VideoWithChannel[]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <TrendingUp className="text-red-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trending</h1>
            <p className="text-sm text-gray-600">Most viewed videos</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(['today', 'week', 'month', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                timeFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {filter === 'today' && 'Today'}
              {filter === 'week' && 'This Week'}
              {filter === 'month' && 'This Month'}
              {filter === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading trending videos..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadTrendingVideos} />
      ) : videos.length > 0 ? (
        <VideoGrid videos={videos} onVideoClick={onVideoClick} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">No trending videos found</p>
        </div>
      )}
    </div>
  );
}
