
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import { Calendar, Eye, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface MyVideosPageProps {
  user: User;
}

type Video = Tables<"videos">;

const MyVideosPage = ({ user }: MyVideosPageProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserVideos();
    fetchUserStats();
  }, []);

  const fetchUserVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching user videos:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("views")
        .eq("user_id", user.id);

      if (videosError) throw videosError;

      const totalVideoViews = videosData.reduce((sum, video) => sum + (video.views || 0), 0);

      setUserCoins(profileData?.coins || 0);
      setTotalViews(totalVideoViews);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-base md:text-lg">Loading your videos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-3 md:p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center text-sm md:text-base">
            <TrendingUp className="h-4 w-4 mr-2 text-yellow-500" />
            Progress Toward 50 Coins
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-300">Current Coins</span>
              <span className="text-yellow-400">{userCoins} / 50</span>
            </div>
            <Progress value={(userCoins / 50) * 100} className="h-2" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 md:p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center text-sm md:text-base">
            <Eye className="h-4 w-4 mr-2 text-blue-500" />
            Progress Toward 1000 Views
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-300">Total Views</span>
              <span className="text-blue-400">{totalViews} / 1000</span>
            </div>
            <Progress value={(totalViews / 1000) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white mb-4">My Videos ({videos.length})</h2>
        
        {videos.length === 0 ? (
          <div className="text-center py-8 md:py-12 px-4">
            <div className="text-gray-400 text-base md:text-lg">No videos uploaded yet</div>
            <div className="text-gray-500 text-sm md:text-base mt-2">Start uploading to track your progress!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-700">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500 text-2xl md:text-4xl">🎥</div>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-3 md:p-4">
                  <h3 className="text-white font-semibold text-sm md:text-base mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{video.views || 0} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(video.created_at || ""), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Growth indicator */}
                    <div className="bg-gray-700 rounded px-2 py-1">
                      <span className="text-green-400 text-xs">
                        📈 Views this week: {Math.floor((video.views || 0) * 0.3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVideosPage;
