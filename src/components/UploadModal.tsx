import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Upload, FileVideo } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  user: User;
  onClose: () => void;
}

const UploadModal = ({ user, onClose }: UploadModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dailyUploads, setDailyUploads] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkDailyUploadLimit();
  }, []);

  const checkDailyUploadLimit = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_uploads")
        .select("upload_count")
        .eq("user_id", user.id)
        .eq("upload_date", new Date().toISOString().split('T')[0])
        .single();

      if (data) {
        setDailyUploads(data.upload_count);
      }
    } catch (error) {
      setDailyUploads(0);
    }
  };

  const updateDailyUploadCount = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error: updateError } = await supabase
        .from("daily_uploads")
        .update({ upload_count: dailyUploads + 1 })
        .eq("user_id", user.id)
        .eq("upload_date", today);

      if (updateError) {
        const { error: insertError } = await supabase
          .from("daily_uploads")
          .insert({
            user_id: user.id,
            upload_date: today,
            upload_count: 1
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Error updating daily upload count:", error);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dailyUploads >= 10) {
      toast({
        title: "Upload Limit Reached",
        description: "You can only upload 10 videos per day. Try again tomorrow!",
        variant: "destructive",
      });
      return;
    }

    if (!videoFile || !title) {
      toast({
        title: "Error",
        description: "Please provide a title and select a video file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload video file
      const videoFileName = `${Date.now()}-${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoFileName, videoFile);

      if (videoError) throw videoError;

      let thumbnailUrl = null;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`;
        const { error: thumbnailError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbnailFileName, thumbnailFile);

        if (thumbnailError) throw thumbnailError;

        const { data: thumbnailData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbnailFileName);

        thumbnailUrl = thumbnailData.publicUrl;
      }

      // Get video URL
      const { data: videoData } = supabase.storage
        .from("videos")
        .getPublicUrl(videoFileName);

      // Save video metadata to database
      const { error: dbError } = await supabase.from("videos").insert({
        title,
        description,
        video_url: videoData.publicUrl,
        thumbnail_url: thumbnailUrl,
        user_id: user.id,
      });

      if (dbError) throw dbError;

      // Update daily upload count
      await updateDailyUploadCount();

      toast({
        title: "Success!",
        description: "📹 Your video has been uploaded successfully after watching the ad!",
      });

      onClose();
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Upload Video</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Daily Upload Limit Display */}
        <div className="mb-6 p-3 bg-blue-900 rounded-lg">
          <p className="text-blue-200 text-sm">
            Daily uploads: {dailyUploads}/10
          </p>
          {dailyUploads >= 10 && (
            <p className="text-red-300 text-sm mt-1">
              You've reached your daily upload limit. Try again tomorrow!
            </p>
          )}
        </div>

        <form onSubmit={handleVideoUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video..."
              rows={4}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video File *
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              {videoFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileVideo className="h-6 w-6 text-red-500" />
                  <span className="text-white">{videoFile.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Select a video file to upload</p>
                  <p className="text-gray-500 text-sm">MP4, WebM, AVI up to 5GB</p>
                </div>
              )}
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="mt-4"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
              {thumbnailFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-white">{thumbnailFile.name}</span>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Select a thumbnail image</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || dailyUploads >= 10}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
