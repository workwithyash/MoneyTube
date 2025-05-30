
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface MilestoneRewardProps {
  user: User;
  videoId: string;
  views: number;
  milestonesClaimed: any;
  onRewardClaimed: () => void;
}

const MilestoneReward = ({ user, videoId, views, milestonesClaimed, onRewardClaimed }: MilestoneRewardProps) => {
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const milestones = [
    { views: 100, coins: 10, label: "First 100 views!" },
    { views: 1000, coins: 50, label: "1K views milestone!" },
    { views: 10000, coins: 200, label: "10K views achieved!" },
  ];

  const getAvailableMilestones = () => {
    return milestones.filter(milestone => 
      views >= milestone.views && !milestonesClaimed?.[milestone.views.toString()]
    );
  };

  const claimReward = async (milestone: any) => {
    setClaiming(true);
    
    try {
      // Record the reward
      const { error: rewardError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: user.id,
          video_id: videoId,
          reward_type: "video_milestone",
          coins_earned: milestone.coins,
        });

      if (rewardError) throw rewardError;

      // Update milestone claimed status
      const updatedMilestones = {
        ...milestonesClaimed,
        [milestone.views.toString()]: true
      };

      const { error: updateError } = await supabase
        .from("videos")
        .update({ milestone_rewards_claimed: updatedMilestones })
        .eq("id", videoId);

      if (updateError) throw updateError;

      // Increment user coins using the database function
      const { error: coinsError } = await supabase.rpc("increment_user_coins", {
        user_id: user.id,
        coins_to_add: milestone.coins
      });

      if (coinsError) throw coinsError;

      toast({
        title: "Reward Claimed!",
        description: `You earned ${milestone.coins} coins for reaching ${milestone.views} views!`,
      });

      onRewardClaimed();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const availableMilestones = getAvailableMilestones();

  if (availableMilestones.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 mb-6">
      <h3 className="text-white font-semibold flex items-center mb-3">
        <Trophy className="h-5 w-5 mr-2" />
        Milestone Rewards Available!
      </h3>
      
      <div className="space-y-2">
        {availableMilestones.map((milestone) => (
          <div key={milestone.views} className="flex items-center justify-between bg-white bg-opacity-20 rounded p-3">
            <div className="text-white">
              <p className="font-medium">{milestone.label}</p>
              <p className="text-sm opacity-90">Earn {milestone.coins} coins</p>
            </div>
            <Button
              onClick={() => claimReward(milestone)}
              disabled={claiming}
              className="bg-white text-orange-600 hover:bg-gray-100"
              size="sm"
            >
              <Gift className="h-4 w-4 mr-1" />
              {claiming ? "Claiming..." : "Collect"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneReward;
