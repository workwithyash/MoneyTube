"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user: {
    username: string;
    avatar_url: string | null;
  };
  user_has_liked: boolean;
}

interface CommentsProps {
  videoId: string;
}

const Comments = ({ videoId }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      // First, get all comments for this video with user profiles
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          likes_count,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("video_id", videoId)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        throw commentsError;
      }

      if (!commentsData) {
        setComments([]);
        return;
      }

      // Then, get user's likes if they're logged in
      let userLikedComments = new Set<string>();
      if (user?.id) {
        const { data: likesData, error: likesError } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id);

        if (likesError) {
          console.error("Error fetching likes:", likesError);
          throw likesError;
        }

        userLikedComments = new Set(likesData?.map(like => like.comment_id) || []);
      }

      // Transform the data to match our Comment interface
      const formattedComments = commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        likes_count: comment.likes_count || 0,
        user: {
          username: comment.profiles?.username || "Anonymous",
          avatar_url: comment.profiles?.avatar_url
        },
        user_has_liked: userLikedComments.has(comment.id)
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error("Error in fetchComments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId, user?.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, check if the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      // Then insert the comment
      const { error } = await supabase.from("comments").insert({
        video_id: videoId,
        user_id: user.id,
        content: newComment.trim(),
        likes_count: 0
      });

      if (error) {
        console.error("Error posting comment:", error);
        throw error;
      }

      setNewComment("");
      await fetchComments();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error: any) {
      console.error("Error in handleSubmitComment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string, hasLiked: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to like comments",
        variant: "destructive",
      });
      return;
    }

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .match({ comment_id: commentId, user_id: user.id });

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });

        if (error) throw error;
      }

      // Refresh comments to get updated like counts
      await fetchComments();
    } catch (error: any) {
      console.error("Error in handleLike:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Comments</h2>
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 bg-gray-800 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            required
          />
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      {isLoadingComments ? (
        <div className="text-center py-4">
          <div className="text-gray-400">Loading comments...</div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400">No comments yet. Be the first to comment!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0">
                  {comment.user.avatar_url && (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.user.username}</span>
                    <span className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-300">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 ${
                        comment.user_has_liked ? "text-red-500" : "text-gray-400"
                      }`}
                      onClick={() => handleLike(comment.id, comment.user_has_liked)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes_count}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments; 