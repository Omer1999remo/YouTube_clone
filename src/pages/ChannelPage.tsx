import { useState, useEffect } from 'react';
import { Video, Channel, supabase } from '../lib/supabase';
import { VideoGrid } from '../components/VideoGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatCount } from '../utils/numbers';

type VideoWithChannel = Video & {
  channels: {
    name: string;
    avatar_url: string;
    handle: string;
    subscriber_count: number;
  };
};

interface ChannelPageProps {
  channelId: string;
  onVideoClick: (video: VideoWithChannel) => void;
  onBack: () => void;
}

export function ChannelPage({ channelId, onVideoClick, onBack }: ChannelPageProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<VideoWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    loadChannelData();
  }, [channelId]);

  const loadChannelData = async () => {
    setLoading(true);
    setError(null);

    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .maybeSingle();

    if (channelError) {
      setError('Failed to load channel. Please try again.');
      setLoading(false);
      return;
    }

    if (!channelData) {
      setError('Channel not found.');
      setLoading(false);
      return;
    }

    setChannel(channelData);

    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('*, channels(name, avatar_url, handle, subscriber_count)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });

    if (videosError) {
      setError('Failed to load videos. Please try again.');
      setLoading(false);
      return;
    }

    if (videosData) {
      setVideos(videosData as VideoWithChannel[]);
    }

    setLoading(false);
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading channel..." />;
  }

  if (error || !channel) {
    return (
      <ErrorMessage
        message={error || 'Channel not found'}
        onRetry={loadChannelData}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
      >
        ← Back
      </button>

      <div
        className="w-full h-48 bg-cover bg-center rounded-xl mb-6"
        style={{
          backgroundImage: channel.banner_url
            ? `url(${channel.banner_url})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
        <img
          src={channel.avatar_url}
          alt={channel.name}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{channel.name}</h1>
          <div className="text-gray-600 mb-3">
            <span className="font-medium">{channel.handle}</span>
            <span className="mx-2">•</span>
            <span>{formatCount(channel.subscriber_count)} subscribers</span>
            <span className="mx-2">•</span>
            <span>{videos.length} videos</span>
          </div>
          <p className="text-sm text-gray-700 mb-4 max-w-2xl">
            {channel.description}
          </p>
          <button
            onClick={handleSubscribe}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              isSubscribed
                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'videos'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'about'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            About
          </button>
        </div>
      </div>

      {activeTab === 'videos' ? (
        videos.length > 0 ? (
          <VideoGrid videos={videos} onVideoClick={onVideoClick} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">No videos yet</p>
          </div>
        )
      ) : (
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold mb-4">About</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Description</h3>
              <p className="text-gray-700">{channel.description || 'No description available'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Channel Details</h3>
              <p className="text-gray-700">
                Joined {new Date(channel.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
