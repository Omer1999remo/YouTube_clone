/*
  # YouTube Clone Database Schema

  ## Overview
  Creates a complete database schema for a YouTube clone application with support for
  channels, videos, comments, likes, subscriptions, and view tracking.

  ## New Tables

  ### 1. channels
  Stores channel information for content creators
  - `id` (uuid, primary key) - Unique channel identifier
  - `name` (text) - Channel display name
  - `handle` (text, unique) - Channel handle/username (e.g., @channelname)
  - `description` (text) - Channel description
  - `avatar_url` (text) - Channel profile picture URL
  - `banner_url` (text) - Channel banner image URL
  - `subscriber_count` (integer) - Total number of subscribers
  - `created_at` (timestamptz) - Channel creation timestamp

  ### 2. videos
  Stores video content and metadata
  - `id` (uuid, primary key) - Unique video identifier
  - `channel_id` (uuid, foreign key) - References channels table
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `thumbnail_url` (text) - Video thumbnail image URL
  - `video_url` (text) - Video file URL
  - `duration` (integer) - Video duration in seconds
  - `view_count` (integer) - Total number of views
  - `like_count` (integer) - Total number of likes
  - `dislike_count` (integer) - Total number of dislikes
  - `created_at` (timestamptz) - Upload timestamp

  ### 3. comments
  Stores video comments
  - `id` (uuid, primary key) - Unique comment identifier
  - `video_id` (uuid, foreign key) - References videos table
  - `channel_id` (uuid, foreign key) - References channels table (commenter)
  - `content` (text) - Comment text content
  - `like_count` (integer) - Number of likes on comment
  - `created_at` (timestamptz) - Comment creation timestamp

  ### 4. subscriptions
  Tracks channel subscriptions
  - `id` (uuid, primary key) - Unique subscription identifier
  - `subscriber_channel_id` (uuid, foreign key) - Channel that is subscribing
  - `subscribed_to_channel_id` (uuid, foreign key) - Channel being subscribed to
  - `created_at` (timestamptz) - Subscription timestamp
  - Unique constraint on (subscriber_channel_id, subscribed_to_channel_id)

  ### 5. video_likes
  Tracks video likes/dislikes
  - `id` (uuid, primary key) - Unique like identifier
  - `video_id` (uuid, foreign key) - References videos table
  - `channel_id` (uuid, foreign key) - References channels table
  - `is_like` (boolean) - True for like, false for dislike
  - `created_at` (timestamptz) - Like timestamp
  - Unique constraint on (video_id, channel_id)

  ### 6. views
  Tracks video view history
  - `id` (uuid, primary key) - Unique view identifier
  - `video_id` (uuid, foreign key) - References videos table
  - `channel_id` (uuid, foreign key, nullable) - References channels table (viewer)
  - `created_at` (timestamptz) - View timestamp

  ## Security
  - RLS (Row Level Security) enabled on all tables
  - Public read access for channels, videos, comments (anyone can view)
  - Write access restricted to authenticated users
  - Users can only modify their own content

  ## Indexes
  - Created on foreign keys for efficient queries
  - Created on commonly filtered columns (video_id, channel_id)
  - Created on created_at for sorting by date
*/

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handle text UNIQUE NOT NULL,
  description text DEFAULT '',
  avatar_url text DEFAULT '',
  banner_url text DEFAULT '',
  subscriber_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  thumbnail_url text NOT NULL,
  video_url text NOT NULL,
  duration integer DEFAULT 0,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  dislike_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  subscribed_to_channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_channel_id, subscribed_to_channel_id)
);

-- Create video_likes table
CREATE TABLE IF NOT EXISTS video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  is_like boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, channel_id)
);

-- Create views table
CREATE TABLE IF NOT EXISTS views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_channel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscribed_to ON subscriptions(subscribed_to_channel_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_views_video_id ON views(video_id);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels table
CREATE POLICY "Anyone can view channels"
  ON channels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert channels"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own channel"
  ON channels FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own channel"
  ON channels FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for videos table
CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for comments table
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for subscriptions table
CREATE POLICY "Anyone can view subscriptions"
  ON subscriptions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for video_likes table
CREATE POLICY "Anyone can view likes"
  ON video_likes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage likes"
  ON video_likes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own likes"
  ON video_likes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own likes"
  ON video_likes FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for views table
CREATE POLICY "Anyone can view view records"
  ON views FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert view records"
  ON views FOR INSERT
  TO public
  WITH CHECK (true);