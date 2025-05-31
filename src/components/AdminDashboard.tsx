import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Minus } from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
    fetchUsers();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      // Get video data to delete files from storage
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("video_url, thumbnail_url")
        .eq("id", videoId)
        .single();

      if (videoError) throw videoError;

      // Delete video file from storage
      if (videoData.video_url) {
        const videoPath = videoData.video_url.split("/").pop();
        if (videoPath) {
          await supabase.storage
            .from("videos")
            .remove([videoPath]);
        }
      }

      // Delete thumbnail file from storage
      if (videoData.thumbnail_url) {
        const thumbnailPath = videoData.thumbnail_url.split("/").pop();
        if (thumbnailPath) {
          await supabase.storage
            .from("thumbnails")
            .remove([thumbnailPath]);
        }
      }

      // Delete video record from database
      const { error: deleteError } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (deleteError) throw deleteError;

      // Update local state
      setVideos(videos.filter(v => v.id !== videoId));
      
      toast({
        title: "Success",
        description: "Video has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePoints = async () => {
    if (!selectedUser || pointsToAdd === 0) {
      toast({
        title: "Error",
        description: "Please select a user and enter points",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc("increment_user_coins", {
        user_id: selectedUser,
        coins_to_add: pointsToAdd
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Points updated for user`,
      });

      // Refresh users list
      fetchUsers();
      setPointsToAdd(0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateViews = async (videoId: string, viewsToAdd: number) => {
    try {
      const { error } = await supabase.rpc("increment_views", {
        video_id: videoId,
        views_to_add: viewsToAdd
      });

      if (error) throw error;

      // Update local state
      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, views: (video.views || 0) + viewsToAdd }
          : video
      ));

      toast({
        title: "Success",
        description: `Views updated for video`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <Button onClick={onLogout} variant="outline" className="text-gray-300">
          Logout
        </Button>
      </div>

      {/* User Points Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Manage User Points</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username || user.email} (Current Points: {user.coins || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Points to Add/Remove
            </label>
            <input
              type="number"
              value={pointsToAdd}
              onChange={(e) => setPointsToAdd(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter points"
            />
          </div>
          <Button
            onClick={handleUpdatePoints}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Update Points
          </Button>
        </div>
      </div>

      {/* Videos Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Manage Videos</h2>
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{video.title}</h3>
                  <p className="text-gray-400 text-sm">
                    By: {video.profiles?.username || "Anonymous"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Views: {video.views || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateViews(video.id, 100)}
                    variant="outline"
                    size="sm"
                    className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    +100 Views
                  </Button>
                  <Button
                    onClick={() => handleUpdateViews(video.id, -100)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    -100 Views
                  </Button>
                  <Button
                    onClick={() => handleDeleteVideo(video.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 