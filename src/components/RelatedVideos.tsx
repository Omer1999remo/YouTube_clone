import { Video } from '../lib/supabase';
import { formatDistanceToNow } from '../utils/formatters';

interface RelatedVideosProps {
  videos: (Video & { channels: { name: string; avatar_url: string } })[];
  onVideoClick: (video: Video & { channels: { name: string; avatar_url: string; handle: string; subscriber_count: number } }) => void;
}

export function RelatedVideos({ videos, onVideoClick }: RelatedVideosProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K`;
    }
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <div
          key={video.id}
          className="flex gap-2 cursor-pointer group"
          onClick={() => onVideoClick(video as Video & { channels: { name: string; avatar_url: string; handle: string; subscriber_count: number } })}
        >
          <div className="relative flex-shrink-0 w-40">
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full aspect-video object-cover rounded-lg group-hover:rounded transition-all duration-200"
            />
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs font-semibold px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-gray-700">
              {video.title}
            </h3>
            <p className="text-xs text-gray-600 mb-1">{video.channels.name}</p>
            <p className="text-xs text-gray-600">
              {formatViews(video.view_count)} views • {formatDistanceToNow(new Date(video.created_at))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
