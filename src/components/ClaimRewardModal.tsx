
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Gift, Play, X } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface ClaimRewardModalProps {
  user: User;
  onClose: () => void;
  onRewardClaimed: () => void;
}

const ClaimRewardModal = ({ user, onClose, onRewardClaimed }: ClaimRewardModalProps) => {
  const [adWatched, setAdWatched] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5); // 5 second ad
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adPlaying && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setAdWatched(true);
    }
    return () => clearTimeout(timer);
  }, [adPlaying, countdown]);

  const startAd = () => {
    setAdPlaying(true);
  };

  const claimReward = async () => {
    try {
      // Give reward to user
      const { error: rewardError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: user.id,
          reward_type: "ad_watch",
          coins_earned: 1
        });

      if (rewardError) throw rewardError;

      // Increment user coins
      const { error: coinsError } = await supabase.rpc("increment_user_coins", {
        user_id: user.id,
        coins_to_add: 1
      });

      if (coinsError) throw coinsError;

      toast({
        title: "Reward Claimed!",
        description: "You earned 1 coin for watching the ad!",
      });

      onRewardClaimed();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 max-w-sm md:max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center">
            <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-500" />
            🎁 Watch Ad to Claim Reward
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-gray-300 mb-4 text-sm md:text-base">
            🎁 "Watch a short ad to claim your reward coin!"
          </p>

          {!adPlaying && !adWatched && (
            <div className="mb-6">
              <div className="w-full h-24 md:h-32 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Play className="h-6 w-6 md:h-8 md:w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs md:text-sm">Ad Preview</p>
                </div>
              </div>
              <Button onClick={startAd} className="w-full bg-red-600 hover:bg-red-700 h-12 md:h-10 text-sm md:text-base">
                <Play className="h-4 w-4 mr-2" />
                Start Ad (5 seconds)
              </Button>
            </div>
          )}

          {adPlaying && !adWatched && (
            <div className="mb-6">
              <div className="w-full h-24 md:h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <div className="text-xl md:text-2xl font-bold">{countdown}</div>
                  <p className="text-xs md:text-sm">Ad playing...</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {adWatched && (
            <div className="mb-6">
              <div className="w-full h-24 md:h-32 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <Gift className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2" />
                  <p className="text-xs md:text-sm">Ad Complete!</p>
                </div>
              </div>
              <Button onClick={claimReward} className="w-full bg-green-600 hover:bg-green-700 h-12 md:h-10 text-sm md:text-base">
                <Gift className="h-4 w-4 mr-2" />
                Claim 1 Coin Reward
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Earn coins by watching ads and support the platform
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimRewardModal;
