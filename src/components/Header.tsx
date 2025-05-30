import { Button } from "@/components/ui/button";
import { Upload, Video, Coins, Home, Gift, Search, Bell } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import CoinsDisplay from "./CoinsDisplay";

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
  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <span className="text-red-500">▶</span>
          <span className="ml-1">VideoTube</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && <CoinsDisplay user={user} />}
          {!user && (
            <Button
              onClick={onSignIn}
              variant="ghost"
              size="sm"
              className="text-blue-400"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Upload Button */}
      {user && (
        <button
          onClick={onUpload}
          className="upload-button"
        >
          <Upload className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-grid">
          <button className="nav-item">
            <Home className="nav-icon" />
            <span className="nav-label">Home</span>
          </button>

          <button className="nav-item" onClick={onMyVideos}>
            <Video className="nav-icon" />
            <span className="nav-label">Library</span>
          </button>

          <button className="nav-item" onClick={onClaimReward}>
            <Gift className="nav-icon" />
            <span className="nav-label">Rewards</span>
          </button>

          <button className="nav-item" onClick={onWithdraw}>
            <Coins className="nav-icon" />
            <span className="nav-label">Withdraw</span>
          </button>

          {user ? (
            <button className="nav-item" onClick={onSignOut}>
              <Bell className="nav-icon" />
              <span className="nav-label">Notifications</span>
            </button>
          ) : (
            <button className="nav-item" onClick={onSignIn}>
              <Bell className="nav-icon" />
              <span className="nav-label">Sign In</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;