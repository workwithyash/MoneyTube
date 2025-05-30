
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Coins } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface CoinsDisplayProps {
  user: User | null;
}

const CoinsDisplay = ({ user }: CoinsDisplayProps) => {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetchCoins();
  }, [user]);

  const fetchCoins = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setCoins(data?.coins || 0);
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2 bg-yellow-600 text-white px-3 py-1 rounded-full">
      <Coins className="h-4 w-4" />
      <span className="font-semibold">{coins}</span>
    </div>
  );
};

export default CoinsDisplay;
