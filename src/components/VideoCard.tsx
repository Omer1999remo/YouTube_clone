import { Video } from '../lib/supabase';
import { formatDistanceToNow } from '../utils/formatters';

interface VideoCardProps {
  video: Video & { channels: { name: string; avatar_url: string; handle: string } };
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
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
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="relative mb-3">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-xl group-hover:rounded-none transition-all duration-200"
        />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex gap-3">
        <img
          src={video.channels.avatar_url}
          alt={video.channels.name}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-gray-700">
            {video.title}
          </h3>
          <div className="text-xs text-gray-600">
            <p className="hover:text-gray-900">{video.channels.name}</p>
            <p>
              {formatViews(video.view_count)} views • {formatDistanceToNow(new Date(video.created_at))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
