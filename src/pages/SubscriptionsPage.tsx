import { useState, useEffect } from 'react';
import { Video, Channel, supabase } from '../lib/supabase';
import { VideoGrid } from '../components/VideoGrid';
import { ChannelCard } from '../components/ChannelCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Users } from 'lucide-react';

type VideoWithChannel = Video & {
  channels: {
    name: string;
    avatar_url: string;
    handle: string;
    subscriber_count: number;
  };
};

interface SubscriptionsPageProps {
  onVideoClick: (video: VideoWithChannel) => void;
  onChannelClick: (channelId: string) => void;
}

export function SubscriptionsPage({ onVideoClick, onChannelClick }: SubscriptionsPageProps) {
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  const [latestVideos, setLatestVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'videos' | 'channels'>('videos');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);

    const { data: subscriptionsData, error: subsError } = await supabase
      .from('subscriptions')
      .select('subscribed_to_channel_id, channels!subscriptions_subscribed_to_channel_id_fkey(*)');

    if (subsError) {
      setError('Failed to load subscriptions. Please try again.');
      setLoading(false);
      return;
    }

    if (subscriptionsData && subscriptionsData.length > 0) {
      const channels = subscriptionsData
        .map(sub => sub.channels)
        .filter(Boolean) as Channel[];

      setSubscribedChannels(channels);

      const channelIds = channels.map(c => c.id);

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*, channels(name, avatar_url, handle, subscriber_count)')
        .in('channel_id', channelIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (videosError) {
        setError('Failed to load videos. Please try again.');
        setLoading(false);
        return;
      }

      if (videosData) {
        setLatestVideos(videosData as VideoWithChannel[]);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
            <p className="text-sm text-gray-600">
              {subscribedChannels.length} channel{subscribedChannels.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('videos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'videos'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Latest Videos
          </button>
          <button
            onClick={() => setActiveView('channels')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'channels'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            All Channels
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading subscriptions..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadSubscriptions} />
      ) : subscribedChannels.length > 0 ? (
        activeView === 'videos' ? (
          latestVideos.length > 0 ? (
            <VideoGrid videos={latestVideos} onVideoClick={onVideoClick} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">No videos from subscribed channels</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {subscribedChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onClick={() => onChannelClick(channel.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="text-gray-400" size={32} />
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-medium mb-1">No subscriptions yet</p>
            <p className="text-sm text-gray-600">
              Subscribe to channels to see their latest videos here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
