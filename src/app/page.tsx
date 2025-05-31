"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import VideoUpload from "@/components/VideoUpload";
import VideoList from "@/components/VideoList";
import AuthModal from "@/components/AuthModal";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end gap-4 mb-4">
          {!user && (
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sign In
            </Button>
          )}
        </div>

        {user ? (
          <>
            <VideoUpload />
            <VideoList />
          </>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to MoneyTube</h1>
            <p className="text-gray-400 mb-8">Please login to upload and watch videos</p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Login to Continue
            </Button>
          </div>
        )}

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    </main>
  );
} 