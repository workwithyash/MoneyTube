import { formatDistanceToNow } from "date-fns";
import { Eye } from "lucide-react";
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
      className="video-card"
    >
      <div className="relative">
        <div className="aspect-video bg-gray-800">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="video-thumbnail"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl">🎥</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="video-info">
        <div className="video-avatar bg-gray-700">
          {video.profiles?.avatar_url ? (
            <img
              src={video.profiles.avatar_url}
              alt={video.profiles.username || ""}
              className="w-full h-full rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center text-gray-400">
              {video.profiles?.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        <div className="video-details">
          <h3 className="video-title text-white">
            {video.title}
          </h3>
          <div className="video-meta">
            <p className="text-gray-400">
              {video.profiles?.username || "Anonymous"}
            </p>
            <p className="flex items-center space-x-1">
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(video.created_at || ""), { addSuffix: true })}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;