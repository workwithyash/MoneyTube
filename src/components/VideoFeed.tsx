import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import VideoCard from "./VideoCard";
import { Tables } from "@/integrations/supabase/types";

type Video = Tables<"videos"> & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const VideoFeed = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (videosError) throw videosError;

      const videosWithProfiles = await Promise.all(
        (videosData || []).map(async (video) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", video.user_id)
            .single();

          return {
            ...video,
            profiles: profileData
          };
        })
      );

      setVideos(videosWithProfiles);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg animate-pulse">Loading videos...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">📺</div>
        <div className="text-gray-400 text-lg mb-2">No videos yet</div>
        <div className="text-gray-500 text-sm">Be the first to share something amazing!</div>
      </div>
    );
  }

  return (
    <div className="main-content pb-20 md:pb-6">
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;