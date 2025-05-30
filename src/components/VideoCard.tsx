
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
      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer group w-full"
    >
      <div className="relative">
        <div className="aspect-video bg-gray-700 flex items-center justify-center">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-500 text-2xl md:text-4xl">🎥</div>
          )}
        </div>
        <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded flex items-center space-x-1">
          <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
          <span className="text-xs">{formatDuration(video.duration)}</span>
        </div>
      </div>
      
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-red-400 transition-colors text-sm md:text-base">
          {video.title}
        </h3>
        
        <div className="flex items-center space-x-2 text-gray-400 text-xs md:text-sm mb-2">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            {video.profiles?.avatar_url ? (
              <img
                src={video.profiles.avatar_url}
                alt={video.profiles.username || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs">
                {video.profiles?.username?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <span className="truncate">{video.profiles?.username || "Anonymous"}</span>
        </div>
        
        <div className="flex flex-col space-y-1 md:flex-row md:items-center md:space-x-4 md:space-y-0 text-gray-500 text-xs">
          <div className="flex items-center space-x-1">
            <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span>{formatViews(video.views)}</span>
          </div>
          <span className="text-xs md:text-sm">
            {formatDistanceToNow(new Date(video.created_at || ""), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
