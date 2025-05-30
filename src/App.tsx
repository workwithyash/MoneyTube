import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VideoPlayer from "./pages/VideoPlayer";
import NotFound from "./pages/NotFound";
import WithdrawPage from "./pages/WithdrawPage";
import AdminPage from "./pages/AdminPage";
import AdBar from "./components/AdBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <AdBar />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/video/:id" element={<VideoPlayer />} />
        <Route path="/666withdraw" element={<WithdrawPage />} />
        <Route path="/999admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
