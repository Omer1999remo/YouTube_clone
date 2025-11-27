import { Channel } from '../lib/supabase';

interface ChannelCardProps {
  channel: Channel;
  onClick?: () => void;
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className="flex flex-col items-center text-center cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={channel.avatar_url}
        alt={channel.name}
        className="w-32 h-32 rounded-full mb-4 group-hover:shadow-lg transition-shadow"
      />
      <h3 className="font-semibold text-lg mb-1 group-hover:text-gray-700">
        {channel.name}
      </h3>
      <p className="text-sm text-gray-600 mb-1">{channel.handle}</p>
      <p className="text-sm text-gray-600 mb-3">
        {formatSubscribers(channel.subscriber_count)} subscribers
      </p>
      <button className="px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm">
        Subscribe
      </button>
    </div>
  );
}
