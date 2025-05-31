"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import UserLogin from "@/components/UserLogin";
import VideoUpload from "@/components/VideoUpload";
import VideoList from "@/components/VideoList";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end gap-4 mb-4">
          {!isAdminLoggedIn && !isUserLoggedIn && (
            <>
              <Button
                onClick={() => setShowUserLogin(!showUserLogin)}
                variant="outline"
                className="text-gray-300"
              >
                {showUserLogin ? "Back to Home" : "User Login"}
              </Button>
              <Button
                onClick={() => setIsAdmin(!isAdmin)}
                variant="outline"
                className="text-gray-300"
              >
                {isAdmin ? "Back to Home" : "Admin Login"}
              </Button>
            </>
          )}
        </div>

        {isAdmin ? (
          isAdminLoggedIn ? (
            <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
          ) : (
            <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
          )
        ) : showUserLogin ? (
          <UserLogin onLoginSuccess={() => {
            setIsUserLoggedIn(true);
            setShowUserLogin(false);
          }} />
        ) : (
          <>
            {isUserLoggedIn ? (
              <>
                <VideoUpload />
                <VideoList />
              </>
            ) : (
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold mb-4">Welcome to MoneyTube</h1>
                <p className="text-gray-400 mb-8">Please login to upload and watch videos</p>
                <Button
                  onClick={() => setShowUserLogin(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Login to Continue
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 