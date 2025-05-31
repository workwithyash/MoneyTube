import { Button } from "@/components/ui/button";
import { Upload, Video, Coins, Home, Gift, Bell, Menu, Share2 } from "lucide-react";
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
  onReferral: () => void;
  onMenu?: () => void;
}

const Header = ({ user, onSignIn, onSignOut, onUpload, onClaimReward, onWithdraw, onMyVideos, onReferral, onMenu }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800 md:hidden">
        <div className="mobile-logo flex items-center">
          <span className="text-red-500">▶</span>
          <span className="ml-1 font-bold">VideoTube</span>
        </div>
        <div className="flex items-center space-x-2">
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
      </header>

      {/* Mobile Upload Button (floating) */}
      {user && (
        <button
          onClick={onUpload}
          className="fixed bottom-20 right-4 z-40 bg-red-600 p-3 rounded-full shadow-lg md:hidden"
        >
          <Upload className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 md:hidden z-30">
        <div className="grid grid-cols-6">
          <button className="nav-item flex flex-col items-center py-2" onClick={() => window.location.pathname = "/"}>
            <Home className="nav-icon h-6 w-6" />
            <span className="nav-label text-xs">Home</span>
          </button>
          <button className="nav-item flex flex-col items-center py-2" onClick={onMyVideos}>
            <Video className="nav-icon h-6 w-6" />
            <span className="nav-label text-xs">Library</span>
          </button>
          <button className="nav-item flex flex-col items-center py-2" onClick={onClaimReward}>
            <Gift className="nav-icon h-6 w-6" />
            <span className="nav-label text-xs">Rewards</span>
          </button>
          <button className="nav-item flex flex-col items-center py-2" onClick={onWithdraw}>
            <Coins className="nav-icon h-6 w-6" />
            <span className="nav-label text-xs">Withdraw</span>
          </button>
          <button className="nav-item flex flex-col items-center py-2" onClick={onReferral}>
            <Share2 className="nav-icon h-6 w-6" />
            <span className="nav-label text-xs">Referral</span>
          </button>
          {user ? (
            <button className="nav-item flex flex-col items-center py-2" onClick={onSignOut}>
              <Bell className="nav-icon h-6 w-6" />
              <span className="nav-label text-xs">Sign Out</span>
            </button>
          ) : (
            <button className="nav-item flex flex-col items-center py-2" onClick={onSignIn}>
              <Bell className="nav-icon h-6 w-6" />
              <span className="nav-label text-xs">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Desktop Header */}
      <header className="hidden md:block bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-red-500">VideoTube</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && <CoinsDisplay user={user} />}
            {user ? (
              <div className="flex items-center space-x-4">
                <Button onClick={onReferral} className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />Referral
                </Button>
                <Button onClick={onClaimReward} className="bg-yellow-600 hover:bg-yellow-700 text-white" size="sm">🎁 Claim Reward</Button>
                <Button onClick={onWithdraw} className="bg-green-600 hover:bg-green-700 text-white" size="sm"><Coins className="h-4 w-4 mr-1" />Withdraw</Button>
                <Button onClick={onMyVideos} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700"><Video className="h-4 w-4 mr-1" />My Videos</Button>
                <Button onClick={onUpload} className="bg-red-600 hover:bg-red-700 text-white"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">{user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <Button onClick={onSignOut} variant="ghost" size="sm" className="text-gray-300 hover:text-white">Sign Out</Button>
                </div>
              </div>
            ) : (
              <Button onClick={onSignIn} className="bg-red-600 hover:bg-red-700 text-white">Sign In</Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;