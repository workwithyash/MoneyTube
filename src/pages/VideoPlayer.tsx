
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, ThumbsUp, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import RewardedAd from "@/components/RewardedAd";
import MilestoneReward from "@/components/MilestoneReward";
import { useToast } from "@/hooks/use-toast";

type Video = Tables<"videos"> & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [canWatchVideo, setCanWatchVideo] = useState(false);
  const [hasWatchedAd, setHasWatchedAd] = useState(false);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    if (id) {
      fetchVideo();
    }
  }, [id]);

  useEffect(() => {
    if (user && video && !hasWatchedAd) {
      checkAdWatchStatus();
    }
  }, [user, video]);

  const checkAdWatchStatus = async () => {
    if (!user || !video) return;

    try {
      const { data, error } = await supabase
        .from("ad_watches")
        .select("*")
        .eq("user_id", user.id)
        .eq("video_id", video.id)
        .single();

      if (data) {
        setHasWatchedAd(true);
        setCanWatchVideo(true);
      } else {
        setShowRewardedAd(true);
      }
    } catch (error) {
      // No ad watch record found, show ad
      setShowRewardedAd(true);
    }
  };

  const fetchVideo = async () => {
    try {
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (videoError) throw videoError;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", videoData.user_id)
        .single();

      setVideo({
        ...videoData,
        profiles: profileData
      });
    } catch (error) {
      console.error("Error fetching video:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAdCompleted = async () => {
    if (!user || !video) return;

    try {
      // Record ad watch
      const { error: adWatchError } = await supabase
        .from("ad_watches")
        .insert({
          user_id: user.id,
          video_id: video.id,
          reward_given: true
        });

      if (adWatchError) throw adWatchError;

      // Give reward to user
      const { error: rewardError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: user.id,
          video_id: video.id,
          reward_type: "ad_watch",
          coins_earned: 5
        });

      if (rewardError) throw rewardError;

      // Increment user coins
      const { error: coinsError } = await supabase.rpc("increment_user_coins", {
        user_id: user.id,
        coins_to_add: 5
      });

      if (coinsError) throw coinsError;

      setHasWatchedAd(true);
      setCanWatchVideo(true);
      setShowRewardedAd(false);
      
      // Increment video views
      await incrementViews();

      toast({
        title: "Reward Earned!",
        description: "You earned 5 coins for watching the ad!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const incrementViews = async () => {
    if (!video) return;

    try {
      const { error } = await supabase.rpc("increment_views", {
        video_id: video.id
      });

      if (error) throw error;

      // Update local state
      setVideo(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleMilestoneRewardClaimed = () => {
    // Refresh video data to update milestone status
    fetchVideo();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Video not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="text-gray-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Videos
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden mb-6">
            {canWatchVideo ? (
              <video
                controls
                className="w-full aspect-video"
                poster={video.thumbnail_url || undefined}
              >
                <source src={video.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-xl text-gray-300">Watch an ad to unlock this video</p>
                  <Button 
                    onClick={() => setShowRewardedAd(true)}
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Watch Ad to Continue
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Milestone Rewards */}
          {user && video.user_id === user.id && (
            <MilestoneReward
              user={user}
              videoId={video.id}
              views={video.views || 0}
              milestonesClaimed={video.milestone_rewards_claimed}
              onRewardClaimed={handleMilestoneRewardClaimed}
            />
          )}

          {/* Video Info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            
            <div className="flex items-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{video.views || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(video.created_at || ""), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                {video.profiles?.avatar_url ? (
                  <img
                    src={video.profiles.avatar_url}
                    alt={video.profiles.username || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">{video.profiles?.username || "Anonymous"}</p>
              </div>
            </div>

            {video.description && (
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rewarded Ad Modal */}
      {showRewardedAd && (
        <RewardedAd
          onAdCompleted={handleAdCompleted}
          onClose={() => setShowRewardedAd(false)}
          videoTitle={video.title}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
