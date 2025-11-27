import { useState, useEffect } from 'react';
import { Video, supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from '../utils/formatters';
import { formatViews, formatDuration } from '../utils/numbers';

type VideoWithChannel = Video & {
  channels: {
    name: string;
    avatar_url: string;
    handle: string;
    subscriber_count: number;
  };
};

type LikedVideo = {
  id: string;
  video_id: string;
  created_at: string;
  videos: VideoWithChannel;
};

interface LikedVideosPageProps {
  onVideoClick: (video: VideoWithChannel) => void;
}

export function LikedVideosPage({ onVideoClick }: LikedVideosPageProps) {
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLikedVideos();
  }, []);

  const loadLikedVideos = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('video_likes')
      .select('id, video_id, created_at, videos(*, channels(name, avatar_url, handle, subscriber_count))')
      .eq('is_like', true)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Failed to load liked videos. Please try again.');
      setLoading(false);
      return;
    }

    if (data) {
      setLikedVideos(data as LikedVideo[]);
    }
    setLoading(false);
  };

  const removeLike = async (likeId: string) => {
    const { error: deleteError } = await supabase
      .from('video_likes')
      .delete()
      .eq('id', likeId);

    if (deleteError) {
      setError('Failed to remove like. Please try again.');
      return;
    }

    setLikedVideos(likedVideos.filter(item => item.id !== likeId));
  };

  const clearAllLikes = async () => {
    if (!confirm('Are you sure you want to remove all likes?')) {
      return;
    }

    const { error: deleteError } = await supabase
      .from('video_likes')
      .delete()
      .eq('is_like', true)
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      setError('Failed to clear likes. Please try again.');
      return;
    }

    setLikedVideos([]);
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <ThumbsUp className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Liked Videos</h1>
            <p className="text-sm text-gray-600">{likedVideos.length} liked videos</p>
          </div>
        </div>

        {likedVideos.length > 0 && (
          <button
            onClick={clearAllLikes}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading liked videos..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadLikedVideos} />
      ) : likedVideos.length > 0 ? (
        <div className="space-y-4">
          {likedVideos.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
            >
              <div
                className="relative flex-shrink-0 w-64 cursor-pointer"
                onClick={() => onVideoClick(item.videos)}
              >
                <img
                  src={item.videos.thumbnail_url}
                  alt={item.videos.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                  {formatDuration(item.videos.duration)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-base line-clamp-2 mb-2 cursor-pointer hover:text-gray-700"
                  onClick={() => onVideoClick(item.videos)}
                >
                  {item.videos.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {item.videos.channels.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {formatViews(item.videos.view_count)} views • {formatDistanceToNow(new Date(item.videos.created_at))}
                </p>
                <p className="text-xs text-gray-500">
                  Liked {formatDistanceToNow(new Date(item.created_at))}
                </p>
              </div>

              <button
                onClick={() => removeLike(item.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-full transition-all h-fit"
                aria-label="Remove like"
              >
                <ThumbsUp size={18} className="text-gray-600 fill-gray-600" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <ThumbsUp className="text-gray-400" size={32} />
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-medium mb-1">No liked videos</p>
            <p className="text-sm text-gray-600">Videos you like will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
