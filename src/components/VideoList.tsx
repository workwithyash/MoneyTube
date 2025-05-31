"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/types/supabase";

type Video = Database["public"]["Tables"]["videos"]["Row"] & {
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
};

const VideoList = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Loading videos...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No videos uploaded yet. Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="aspect-video relative">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400">No thumbnail</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-sm">
              {video.views || 0} views
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {video.description || "No description"}
            </p>
            <div className="flex items-center">
              {video.profiles?.avatar_url ? (
                <img
                  src={video.profiles.avatar_url}
                  alt={video.profiles.username}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 mr-2" />
              )}
              <span className="text-gray-300 text-sm">
                {video.profiles?.username || "Anonymous"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList; 