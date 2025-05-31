"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ReferralSystem from "./ReferralSystem";
import { User } from "@supabase/supabase-js";

interface ReferralModalProps {
  user: User;
  onClose: () => void;
}

const ReferralModal = ({ user, onClose }: ReferralModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Referral System</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">How it works</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Share your unique referral code with friends</li>
              <li>When they sign up using your code, you get 40 coins</li>
              <li>They get 10 coins for using your code during signup</li>
              <li>If they enter your code later, they get 60 coins (you get none)</li>
              <li>Each user can only use one referral code</li>
            </ul>
          </div>

          <ReferralSystem userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default ReferralModal; 