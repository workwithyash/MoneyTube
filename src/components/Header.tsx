import { Button } from "@/components/ui/button";
import { Upload, User, Video, Coins, Menu } from "lucide-react";
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
  onMenu?: () => void;
}

const Header = ({ user, onSignIn, onSignOut, onUpload, onClaimReward, onWithdraw, onMyVideos, onMenu }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-3 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg md:text-2xl font-bold text-red-500">VideoTube</h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
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
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm text-white">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <Button
                  onClick={onSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
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

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {user && <CoinsDisplay user={user} />}
          <Button
            onClick={onMenu ? onMenu : () => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-800">
          {user ? (
            <div className="space-y-3">
              <Button
                onClick={() => {
                  onClaimReward();
                  setMobileMenuOpen(false);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                size="sm"
              >
                🎁 Claim Reward
              </Button>

              <Button
                onClick={() => {
                  onWithdraw();
                  setMobileMenuOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                size="sm"
              >
                <Coins className="h-4 w-4 mr-1" />
                Withdraw
              </Button>

              <Button
                onClick={() => {
                  onMyVideos();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full"
                size="sm"
              >
                <Video className="h-4 w-4 mr-1" />
                My Videos
              </Button>
              
              <Button
                onClick={() => {
                  onUpload();
                  setMobileMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-300 text-sm">{user.email}</span>
                </div>
                <Button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                onSignIn();
                setMobileMenuOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white w-full"
            >
              Sign In
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
