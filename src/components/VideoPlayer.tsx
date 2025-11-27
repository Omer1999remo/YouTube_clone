import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from 'lucide-react';
import { Video, Comment, supabase } from '../lib/supabase';
import { formatDistanceToNow } from '../utils/formatters';
import { RelatedVideos } from './RelatedVideos';
import { CommentForm } from './CommentForm';

interface VideoPlayerProps {
  video: Video & { channels: { name: string; avatar_url: string; handle: string; subscriber_count: number } };
  onBack: () => void;
  relatedVideos?: (Video & { channels: { name: string; avatar_url: string } })[];
  onVideoClick?: (video: Video & { channels: { name: string; avatar_url: string; handle: string; subscriber_count: number } }) => void;
}

export function VideoPlayer({ video, onBack, relatedVideos = [], onVideoClick }: VideoPlayerProps) {
  const [comments, setComments] = useState<(Comment & { channels: { name: string; avatar_url: string } })[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadComments();
  }, [video.id]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, channels(name, avatar_url)')
      .eq('video_id', video.id)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data as (Comment & { channels: { name: string; avatar_url: string } })[]);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    console.log('Comment submitted:', content);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}K`;
    }
    return views.toString();
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
      >
        ← Back to Home
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-black aspect-video rounded-xl overflow-hidden mb-4">
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-sm">Video Player Placeholder</p>
            </div>
          </div>

          <h1 className="text-xl font-bold mb-2">{video.title}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={video.channels.avatar_url}
                alt={video.channels.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{video.channels.name}</h3>
                <p className="text-xs text-gray-600">
                  {formatViews(video.channels.subscriber_count)} subscribers
                </p>
              </div>
              <button className="px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors text-sm">
                Subscribe
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
                <button className="px-3 sm:px-4 py-2 hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <ThumbsUp size={18} />
                  <span className="font-medium text-sm">{formatCount(video.like_count)}</span>
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button className="px-3 sm:px-4 py-2 hover:bg-gray-200 transition-colors">
                  <ThumbsDown size={18} />
                </button>
              </div>
              <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Share2 size={18} />
              </button>
              <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <div className="font-semibold text-sm mb-2">
              {formatViews(video.view_count)} views • {formatDistanceToNow(new Date(video.created_at))}
            </div>
            <p className={`text-sm whitespace-pre-wrap ${!showFullDescription ? 'line-clamp-2' : ''}`}>
              {video.description}
            </p>
            {video.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm font-semibold mt-2 hover:text-gray-700"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">{comments.length} Comments</h2>

            <CommentForm onSubmit={handleCommentSubmit} />

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.channels.avatar_url}
                    alt={comment.channels.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.channels.name}</span>
                      <span className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(comment.created_at))}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs hover:text-gray-700">
                        <ThumbsUp size={14} />
                        <span>{comment.like_count > 0 ? comment.like_count : ''}</span>
                      </button>
                      <button className="flex items-center gap-1 text-xs hover:text-gray-700">
                        <ThumbsDown size={14} />
                      </button>
                      <button className="text-xs font-semibold hover:text-gray-700">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="font-semibold mb-3">Related Videos</h2>
          {relatedVideos.length > 0 && onVideoClick ? (
            <RelatedVideos videos={relatedVideos} onVideoClick={onVideoClick} />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">No related videos available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
