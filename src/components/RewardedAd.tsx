
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Gift, X } from "lucide-react";

interface RewardedAdProps {
  onAdCompleted: () => void;
  onClose: () => void;
  videoTitle: string;
}

const RewardedAd = ({ onAdCompleted, onClose, videoTitle }: RewardedAdProps) => {
  const [adWatched, setAdWatched] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10 second ad

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

  const claimReward = () => {
    onAdCompleted();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 max-w-sm md:max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center">
            <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-500" />
            Watch Ad to Continue
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
            Watch a short ad to unlock "{videoTitle}" and earn coins!
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
                Start Ad (10 seconds)
              </Button>
            </div>
          )}

          {adPlaying && !adWatched && (
            <div className="mb-6">
              <div className="w-full h-24 md:h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <div className="text-xl md:text-2xl font-bold">{countdown}</div>
                  <p className="text-xs md:text-sm">Ad playing...</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
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
                Claim Reward & Watch Video
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            You'll earn coins for watching ads and supporting creators
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardedAd;
