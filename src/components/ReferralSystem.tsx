"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2 } from "lucide-react";

interface ReferralSystemProps {
  userId: string;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ userId }) => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralCode();
  }, [userId]);

  const fetchReferralCode = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No referral code exists, create one
          await createReferralCode();
        } else {
          throw error;
        }
      } else {
        setReferralCode(data.code);
      }
    } catch (error) {
      console.error("Error fetching referral code:", error);
      toast({
        title: "Error",
        description: "Failed to load referral code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      const { data, error } = await supabase
        .rpc("generate_referral_code");

      if (error) throw error;

      const { error: insertError } = await supabase
        .from("referral_codes")
        .insert({
          user_id: userId,
          code: data,
        });

      if (insertError) throw insertError;

      setReferralCode(data);
    } catch (error) {
      console.error("Error creating referral code:", error);
      toast({
        title: "Error",
        description: "Failed to create referral code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Check if user has already used a referral code
      const { data: existingUsage, error: usageError } = await supabase
        .from("referral_usage")
        .select("id")
        .eq("referred_id", userId)
        .single();

      if (existingUsage) {
        toast({
          title: "Error",
          description: "You have already used a referral code.",
          variant: "destructive",
        });
        return;
      }

      // Get referrer's user_id from the code
      const { data: referrerData, error: referrerError } = await supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", inputCode.toUpperCase())
        .single();

      if (referrerError || !referrerData) {
        toast({
          title: "Error",
          description: "Invalid referral code.",
          variant: "destructive",
        });
        return;
      }

      if (referrerData.user_id === userId) {
        toast({
          title: "Error",
          description: "You cannot use your own referral code.",
          variant: "destructive",
        });
        return;
      }

      // Record the referral usage and distribute rewards
      const { error: rewardError } = await supabase
        .rpc("handle_referral_reward", {
          referrer_id: referrerData.user_id,
          referred_id: userId,
          reward_type: "referral_page",
        });

      if (rewardError) throw rewardError;

      const { error: usageInsertError } = await supabase
        .from("referral_usage")
        .insert({
          referrer_id: referrerData.user_id,
          referred_id: userId,
          reward_type: "referral_page",
        });

      if (usageInsertError) throw usageInsertError;

      toast({
        title: "Success",
        description: "You've received 60 coins for using the referral code!",
      });

      setInputCode("");
    } catch (error) {
      console.error("Error submitting referral code:", error);
      toast({
        title: "Error",
        description: "Failed to process referral code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Success",
        description: "Referral code copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral code.",
        variant: "destructive",
      });
    }
  };

  const shareReferralCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join MoneyTube!",
          text: `Use my referral code ${referralCode} to get 60 coins when you join MoneyTube!`,
        });
      } else {
        await copyToClipboard();
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg animate-pulse">Loading referral system...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends to earn coins when they join!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareReferralCode}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter Referral Code</CardTitle>
          <CardDescription>
            Enter a friend's referral code to get 60 coins!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="font-mono"
              maxLength={8}
            />
            <Button
              onClick={handleSubmitCode}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralSystem; 