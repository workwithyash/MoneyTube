import { Button } from "@/components/ui/button";
import { Upload, User, Video, Coins, Menu, Home, Gift } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import CoinsDisplay from "./CoinsDisplay";
import { useState } from "react";

interface HeaderProps {
  user: SupabaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onUpload: () => void;
  onClaimReward: () => void;
  onWithdraw: () => void;
  onMyVideos: () => void;
}

const Header = ({ user, onSignIn, onSignOut, onUpload, onClaimReward, onWithdraw, onMyVideos }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-red-500">VideoTube</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <CoinsDisplay user={user} />}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={onClaimReward}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  🎁 Claim Reward
                </Button>

                <Button
                  onClick={onWithdraw}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Coins className="h-4 w-4 mr-1" />
                  Withdraw
                </Button>

                <Button
                  onClick={onMyVideos}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Video className="h-4 w-4 mr-1" />
                  My Videos
                </Button>
                
                <Button
                  onClick={onUpload}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                
                <Button
                  onClick={onSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={onSignIn}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 md:hidden sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-500">VideoTube</h1>
          {user && <CoinsDisplay user={user} />}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 md:hidden z-50">
          <div className="grid grid-cols-5 gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2 text-gray-400 hover:text-white"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2 text-gray-400 hover:text-white"
              onClick={onMyVideos}
            >
              <Video className="h-5 w-5 mb-1" />
              <span className="text-xs">Videos</span>
            </Button>

            <Button
              onClick={onUpload}
              className="flex flex-col items-center py-2 bg-red-600 hover:bg-red-700 rounded-full -mt-4 shadow-lg"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs">Upload</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2 text-gray-400 hover:text-white"
              onClick={onClaimReward}
            >
              <Gift className="h-5 w-5 mb-1" />
              <span className="text-xs">Rewards</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-2 text-gray-400 hover:text-white"
              onClick={onWithdraw}
            >
              <Coins className="h-5 w-5 mb-1" />
              <span className="text-xs">Withdraw</span>
            </Button>
          </div>
        </nav>
      )}
    </>
  );
};

export default Header;