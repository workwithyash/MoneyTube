
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Coins, Calendar, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WithdrawRequest {
  id: string;
  user_id: string;
  method: string;
  number: string;
  coins: number;
  payout: number;
  is_confirmed: boolean;
  created_at: string;
}

const AdminPage = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawRequests();
  }, []);

  const fetchWithdrawRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("withdraw_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmWithdrawal = async (requestId: string, coins: number) => {
    setConfirming(requestId);
    
    try {
      // Update the withdrawal request to confirmed
      const { error: updateError } = await supabase
        .from("withdraw_requests")
        .update({ is_confirmed: true })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Get the request to find user_id
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error("Request not found");

      // Deduct coins from user
      const { error: coinsError } = await supabase.rpc("increment_user_coins", {
        user_id: request.user_id,
        coins_to_add: -coins
      });

      if (coinsError) throw coinsError;

      toast({
        title: "Withdrawal confirmed!",
        description: `Successfully processed withdrawal for ${coins} coins.`,
      });

      // Refresh the list
      fetchWithdrawRequests();
    } catch (error: any) {
      toast({
        title: "Confirmation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-white text-lg md:text-xl">Loading...</div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => !r.is_confirmed);
  const confirmedRequests = requests.filter(r => r.is_confirmed);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center">
          <UserIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-yellow-500" />
          Admin: Withdrawal Management
        </h1>

        {/* Pending Requests Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-yellow-400">
            Pending Withdrawals ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 text-center">
              <p className="text-gray-400 text-sm md:text-base">No pending withdrawal requests</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-mono text-sm">
                            User: {request.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold flex items-center">
                            <Coins className="h-4 w-4 mr-1" />
                            {request.coins}
                          </p>
                          <p className="text-green-400 font-semibold text-sm">
                            ₹{request.payout.toFixed(3)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm">
                            {request.method === 'paytm' ? '📲 Paytm/UPI' : '🏦 Bank'}
                          </p>
                          <p className="text-white font-mono text-sm">{request.number}</p>
                        </div>
                        
                        <Button
                          onClick={() => confirmWithdrawal(request.id, request.coins)}
                          disabled={confirming === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          {confirming === request.id ? (
                            'Processing...'
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Confirm
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Method</TableHead>
                      <TableHead className="text-gray-300">Number</TableHead>
                      <TableHead className="text-gray-300">Coins</TableHead>
                      <TableHead className="text-gray-300">Payout</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id} className="border-gray-700">
                        <TableCell className="text-white font-mono text-sm">
                          {request.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-white">
                          {request.method === 'paytm' ? '📲 Paytm/UPI' : '🏦 Bank'}
                        </TableCell>
                        <TableCell className="text-white font-mono">
                          {request.number}
                        </TableCell>
                        <TableCell className="text-yellow-400 font-semibold">
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-1" />
                            {request.coins}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-400 font-semibold">
                          ₹{request.payout.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(request.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => confirmWithdrawal(request.id, request.coins)}
                            disabled={confirming === request.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            {confirming === request.id ? (
                              'Processing...'
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Confirm
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {/* Confirmed Requests Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-green-400">
            Confirmed Withdrawals ({confirmedRequests.length})
          </h2>
          
          {confirmedRequests.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 text-center">
              <p className="text-gray-400 text-sm md:text-base">No confirmed withdrawals yet</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4">
                {confirmedRequests.map((request) => (
                  <div key={request.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-mono text-sm">
                            User: {request.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold flex items-center">
                            <Coins className="h-4 w-4 mr-1" />
                            {request.coins}
                          </p>
                          <p className="text-green-400 font-semibold text-sm">
                            ₹{request.payout.toFixed(3)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white text-sm">
                            {request.method === 'paytm' ? '📲 Paytm/UPI' : '🏦 Bank'}
                          </p>
                          <p className="text-white font-mono text-sm">{request.number}</p>
                        </div>
                        <div className="text-green-400 text-sm font-medium">
                          ✅ Confirmed
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Method</TableHead>
                      <TableHead className="text-gray-300">Number</TableHead>
                      <TableHead className="text-gray-300">Coins</TableHead>
                      <TableHead className="text-gray-300">Payout</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmedRequests.map((request) => (
                      <TableRow key={request.id} className="border-gray-700">
                        <TableCell className="text-white font-mono text-sm">
                          {request.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-white">
                          {request.method === 'paytm' ? '📲 Paytm/UPI' : '🏦 Bank'}
                        </TableCell>
                        <TableCell className="text-white font-mono">
                          {request.number}
                        </TableCell>
                        <TableCell className="text-yellow-400 font-semibold">
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-1" />
                            {request.coins}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-400 font-semibold">
                          ₹{request.payout.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(request.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
