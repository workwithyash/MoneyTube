"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import VideoUpload from "@/components/VideoUpload";
import VideoList from "@/components/VideoList";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {!isAdminLoggedIn ? (
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsAdmin(!isAdmin)}
              variant="outline"
              className="text-gray-300"
            >
              {isAdmin ? "Back to Home" : "Admin Login"}
            </Button>
          </div>
        ) : null}

        {isAdmin ? (
          isAdminLoggedIn ? (
            <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
          ) : (
            <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
          )
        ) : (
          <>
            <VideoUpload />
            <VideoList />
          </>
        )}
      </div>
    </main>
  );
} 