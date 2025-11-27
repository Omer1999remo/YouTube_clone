import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Channel = {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar_url: string;
  banner_url: string;
  subscriber_count: number;
  created_at: string;
};

export type Video = {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  view_count: number;
  like_count: number;
  dislike_count: number;
  created_at: string;
  channels?: Channel;
};

export type Comment = {
  id: string;
  video_id: string;
  channel_id: string;
  content: string;
  like_count: number;
  created_at: string;
  channels?: Channel;
};
