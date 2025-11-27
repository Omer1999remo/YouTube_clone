import { Video } from '../lib/supabase';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: (Video & { channels: { name: string; avatar_url: string; handle: string } })[];
  onVideoClick: (video: Video & { channels: { name: string; avatar_url: string; handle: string; subscriber_count: number } }) => void;
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={() => onVideoClick(video as Video & { channels: { name: string; avatar_url: string; handle: string; subscriber_count: number } })}
        />
      ))}
    </div>
  );
}
