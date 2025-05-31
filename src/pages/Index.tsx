import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import VideoFeed from "@/components/VideoFeed";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import UploadModal from "@/components/UploadModal";
import ClaimRewardModal from "@/components/ClaimRewardModal";
import WithdrawModal from "@/components/WithdrawModal";
import ReferralModal from "@/components/ReferralModal";
import MyVideosPage from "@/components/MyVideosPage";
import RewardedAd from "@/components/RewardedAd";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showMyVideos, setShowMyVideos] = useState(false);
  const [showUploadAd, setShowUploadAd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpload = () => {
    setShowUploadAd(true);
  };

  const handleUploadAdCompleted = () => {
    setShowUploadAd(false);
    setShowUploadModal(true);
  };

  const handleClaimReward = () => {
    setShowClaimRewardModal(true);
  };

  const handleRewardClaimed = () => {
    // Refresh coins display by triggering a re-render
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-white text-lg md:text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        user={user} 
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        onUpload={handleUpload}
        onClaimReward={handleClaimReward}
        onWithdraw={() => setShowWithdrawModal(true)}
        onMyVideos={() => setShowMyVideos(true)}
        onReferral={() => setShowReferralModal(true)}
        onMenu={() => setSidebarOpen(true)}
      />
      
      <div className="flex min-h-[calc(100vh-80px)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-3 md:p-6">
          {showMyVideos && user ? (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <h1 className="text-xl md:text-2xl font-bold">My Videos</h1>
                <Button
                  onClick={() => setShowMyVideos(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full md:w-auto"
                >
                  Back to Home
                </Button>
              </div>
              <MyVideosPage user={user} />
            </div>
          ) : (
            <VideoFeed />
          )}
        </main>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showUploadAd && user && (
        <RewardedAd
          onAdCompleted={handleUploadAdCompleted}
          onClose={() => setShowUploadAd(false)}
          videoTitle="Upload Video"
        />
      )}

      {showUploadModal && user && (
        <UploadModal 
          user={user} 
          onClose={() => setShowUploadModal(false)} 
        />
      )}

      {showClaimRewardModal && user && (
        <ClaimRewardModal
          user={user}
          onClose={() => setShowClaimRewardModal(false)}
          onRewardClaimed={handleRewardClaimed}
        />
      )}

      {showWithdrawModal && user && (
        <WithdrawModal
          user={user}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}

      {showReferralModal && user && (
        <ReferralModal
          user={user}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
};

export default Index;
