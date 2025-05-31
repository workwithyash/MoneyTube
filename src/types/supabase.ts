export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          video_url: string
          thumbnail_url: string | null
          user_id: string
          views: number
          duration: number
          milestone_rewards_claimed: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string
          video_url: string
          thumbnail_url?: string | null
          user_id: string
          views?: number
          duration?: number
          milestone_rewards_claimed?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          video_url?: string
          thumbnail_url?: string | null
          user_id?: string
          views?: number
          duration?: number
          milestone_rewards_claimed?: Json
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          avatar_url: string | null
          email: string
          coins: number
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          avatar_url?: string | null
          email: string
          coins?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          avatar_url?: string | null
          email?: string
          coins?: number
        }
      }
      daily_uploads: {
        Row: {
          id: string
          user_id: string
          upload_date: string
          upload_count: number
        }
        Insert: {
          id?: string
          user_id: string
          upload_date: string
          upload_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          upload_date?: string
          upload_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_user_coins: {
        Args: {
          user_id: string
          coins_to_add: number
        }
        Returns: void
      }
      increment_views: {
        Args: {
          video_id: string
          views_to_add: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 