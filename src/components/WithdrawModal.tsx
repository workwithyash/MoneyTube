
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Coins, TrendingUp } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
}

const WithdrawModal = ({ user, onClose }: WithdrawModalProps) => {
  const [userCoins, setUserCoins] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const MIN_COINS_TO_WITHDRAW = 50;
  const MIN_VIEWS_TO_WITHDRAW = 1000;

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Get user coins
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get total views across all user's videos
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

  const canWithdraw = userCoins >= MIN_COINS_TO_WITHDRAW && totalViews >= MIN_VIEWS_TO_WITHDRAW;

  const handleWithdraw = () => {
    if (!canWithdraw) {
      toast({
        title: "Requirements not met",
        description: `You need at least ${MIN_COINS_TO_WITHDRAW} coins and ${MIN_VIEWS_TO_WITHDRAW} total views to unlock withdrawals.`,
        variant: "destructive",
      });
      return;
    }

    onClose();
    navigate('/666withdraw');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md">
          <div className="text-white text-center text-sm md:text-base">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-500" />
            Withdraw Earnings
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Current Stats */}
          <div className="bg-gray-700 rounded-lg p-3 md:p-4">
            <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Your Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-300">Coins</span>
                  <span className="text-yellow-400">{userCoins} / {MIN_COINS_TO_WITHDRAW}</span>
                </div>
                <Progress value={(userCoins / MIN_COINS_TO_WITHDRAW) * 100} className="mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-300">Total Views</span>
                  <span className="text-blue-400">{totalViews} / {MIN_VIEWS_TO_WITHDRAW}</span>
                </div>
                <Progress value={(totalViews / MIN_VIEWS_TO_WITHDRAW) * 100} className="mt-1" />
              </div>
            </div>
          </div>

          {!canWithdraw ? (
            <div className="bg-red-900 border border-red-700 rounded-lg p-3 md:p-4">
              <p className="text-red-200 text-xs md:text-sm">
                ❌ You need at least {MIN_COINS_TO_WITHDRAW} coins and {MIN_VIEWS_TO_WITHDRAW} total views to unlock withdrawals.
              </p>
              <p className="text-red-300 text-xs mt-2">
                💰 You need {userCoins} / {MIN_COINS_TO_WITHDRAW} coins and {totalViews} / {MIN_VIEWS_TO_WITHDRAW} total views to withdraw. Keep earning more and come back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-900 border border-green-700 rounded-lg p-3 md:p-4">
                <p className="text-green-200 text-xs md:text-sm">
                  ✅ You're eligible to withdraw! 10 coins = ₹0.01
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white h-12 md:h-10 text-sm md:text-base"
              >
                Continue to Withdrawal Page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
