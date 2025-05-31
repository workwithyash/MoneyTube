"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import UploadModal from "./UploadModal";
import { useUser } from "@/hooks/use-user";

const VideoUpload = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="mb-8">
      <Button
        onClick={() => setShowUploadModal(true)}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Video
      </Button>

      {showUploadModal && (
        <UploadModal
          user={user}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

export default VideoUpload; 