
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const WithdrawPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [method, setMethod] = useState<'paytm' | 'bank'>('paytm');
  const [number, setNumber] = useState('');
  const [coinsToWithdraw, setCoinsToWithdraw] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const MIN_COINS_TO_WITHDRAW = 50;
  const MIN_VIEWS_TO_WITHDRAW = 1000;
  const CONVERSION_RATE = 0.001; // 10 coins = ₹0.01

  useEffect(() => {
    checkUserAndFetchStats();
  }, []);

  const checkUserAndFetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/');
        return;
      }

      setUser(session.user);

      // Get user coins
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      // Get total views across all user's videos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("views")
        .eq("user_id", session.user.id);

      if (videosError) throw videosError;

      const totalVideoViews = videosData.reduce((sum, video) => sum + (video.views || 0), 0);

      setUserCoins(profileData?.coins || 0);
      setTotalViews(totalVideoViews);

      // Check if user meets withdrawal criteria
      if (profileData?.coins < MIN_COINS_TO_WITHDRAW || totalVideoViews < MIN_VIEWS_TO_WITHDRAW) {
        toast({
          title: "Requirements not met",
          description: `You need at least ${MIN_COINS_TO_WITHDRAW} coins and ${MIN_VIEWS_TO_WITHDRAW} total views to withdraw.`,
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number.trim() || !coinsToWithdraw) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const coins = parseInt(coinsToWithdraw);
    if (coins < 10 || coins > userCoins || coins % 10 !== 0) {
      toast({
        title: "Invalid coin amount",
        description: "Please enter a valid amount in multiples of 10.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payout = (coins / 10) * 0.01; // 10 coins = ₹0.01

      // Create withdrawal request in database
      const { error: dbError } = await supabase
        .from("withdraw_requests")
        .insert({
          user_id: user!.id,
          method,
          number: number.trim(),
          coins,
          payout
        });

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-withdrawal-email', {
        body: {
          userEmail: user!.email,
          userId: user!.id,
          method,
          number: number.trim(),
          coins,
          payout: payout.toFixed(3)
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw error here as the withdrawal request was created successfully
      }

      toast({
        title: "Withdrawal request submitted!",
        description: "You will be notified after confirmation.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-white text-lg md:text-xl">Loading...</div>
      </div>
    );
  }

  const maxWithdrawableCoins = Math.min(userCoins, Math.floor(userCoins / 10) * 10);
  const selectedCoins = parseInt(coinsToWithdraw) || 0;
  const estimatedPayout = (selectedCoins / 10) * 0.01;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 md:p-6">
      <div className="max-w-sm md:max-w-md mx-auto">
        <div className="flex items-center mb-4 md:mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white mr-2 md:mr-4 p-2"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <h1 className="text-lg md:text-2xl font-bold">Ready to Withdraw Your Earnings?</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-center text-yellow-400 mb-2">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="font-semibold text-sm md:text-base">Your Balance: {userCoins} coins</span>
          </div>
          <p className="text-gray-300 text-xs md:text-sm">Total Views: {totalViews}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-300 mb-3">
              Select Payment Method:
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  value="paytm"
                  checked={method === 'paytm'}
                  onChange={(e) => setMethod(e.target.value as 'paytm')}
                  className="mr-3 text-yellow-500 focus:ring-yellow-500 w-4 h-4"
                />
                <span className="text-sm md:text-base">📲 Paytm/UPI Number</span>
              </label>
              <label className="flex items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  value="bank"
                  checked={method === 'bank'}
                  onChange={(e) => setMethod(e.target.value as 'bank')}
                  className="mr-3 text-yellow-500 focus:ring-yellow-500 w-4 h-4"
                />
                <span className="text-sm md:text-base">🏦 Bank Account Number</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-300 mb-2">
              {method === 'paytm' ? 'Paytm/UPI Number' : 'Bank Account Number'}
            </label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-3 md:py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter your number here"
              required
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-300 mb-2">
              Coins to Withdraw (multiples of 10)
            </label>
            <input
              type="number"
              min="10"
              max={maxWithdrawableCoins}
              step="10"
              value={coinsToWithdraw}
              onChange={(e) => setCoinsToWithdraw(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-3 md:py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter coins (10, 20, 30...)"
              required
            />
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Max withdrawable: {maxWithdrawableCoins} coins
            </p>
          </div>

          {selectedCoins > 0 && (
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-white text-sm md:text-base">
                Estimated Payout: <span className="text-yellow-400 font-semibold">₹{estimatedPayout.toFixed(3)}</span>
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !number.trim() || !coinsToWithdraw}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 h-12 md:h-10 text-base md:text-sm font-medium"
          >
            {submitting ? 'Submitting...' : 'Request Withdrawal'}
          </Button>
        </form>

        <div className="mt-4 md:mt-6 text-xs text-gray-500 text-center space-y-1">
          <p>After submitting, you will receive a confirmation email.</p>
          <p>Processing time: 1-3 business days</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
