import { Button } from "@/components/ui/button";
import { X, Home, Video, Gift, Coins, Share2 } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user?: SupabaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onUpload?: () => void;
  onClaimReward?: () => void;
  onWithdraw?: () => void;
  onMyVideos?: () => void;
  onReferral?: () => void;
}

const Sidebar = ({ 
  open, 
  onClose, 
  user, 
  onSignIn, 
  onSignOut, 
  onUpload, 
  onClaimReward, 
  onWithdraw, 
  onMyVideos,
  onReferral 
}: SidebarProps) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out z-50 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => {
                  window.location.pathname = "/";
                  onClose();
                }}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => {
                      onMyVideos?.();
                      onClose();
                    }}
                  >
                    <Video className="h-5 w-5 mr-3" />
                    My Videos
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => {
                      onClaimReward?.();
                      onClose();
                    }}
                  >
                    <Gift className="h-5 w-5 mr-3" />
                    Claim Reward
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => {
                      onWithdraw?.();
                      onClose();
                    }}
                  >
                    <Coins className="h-5 w-5 mr-3" />
                    Withdraw
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => {
                      onReferral?.();
                      onClose();
                    }}
                  >
                    <Share2 className="h-5 w-5 mr-3" />
                    Referral
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => {
                      onUpload?.();
                      onClose();
                    }}
                  >
                    <Video className="h-5 w-5 mr-3" />
                    Upload Video
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-800"
                    onClick={() => {
                      onSignOut?.();
                      onClose();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => {
                    onSignIn?.();
                    onClose();
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
