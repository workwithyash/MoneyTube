import { formatDistanceToNow } from "date-fns";
import { Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Video = Tables<"videos"> & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const navigate = useNavigate();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number | null) => {
    if (!views) return "0 views";
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const handleVideoClick = () => {
    navigate(`/video/${video.id}`);
  };

  return (
    <div 
      onClick={handleVideoClick}
      className="video-card bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group"
    >
      <div className="relative">
        <div className="aspect-video bg-gray-700">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="video-thumbnail w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl">🎥</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        </div>
      </div>
      
      <div className="video-info p-3">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center">
              {video.profiles?.avatar_url ? (
                <img
                  src={video.profiles.avatar_url}
                  alt={video.profiles.username || "User"}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm">
                  {video.profiles?.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="video-title text-white font-medium line-clamp-2 group-hover:text-red-400 transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1 truncate">
              {video.profiles?.username || "Anonymous"}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                <span>{formatViews(video.views)}</span>
              </div>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(video.created_at || ""), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;