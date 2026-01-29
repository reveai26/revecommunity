export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string
          user_id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'admin'
          subscription_tier: 'free' | 'basic' | 'pro' | 'max'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin'
          subscription_tier?: 'free' | 'basic' | 'pro' | 'max'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin'
          subscription_tier?: 'free' | 'basic' | 'pro' | 'max'
          created_at?: string
          updated_at?: string
        }
      }
      free_posts: {
        Row: {
          id: string
          author_id: string
          content: string
          images: any
          likes_count: number
          comments_count: number
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          images?: any
          likes_count?: number
          comments_count?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          images?: any
          likes_count?: number
          comments_count?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contents: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          content_type: 'blog' | 'youtube'
          body: string | null
          youtube_url: string | null
          youtube_id: string | null
          thumbnail_url: string | null
          access_tier: 'free' | 'basic' | 'pro' | 'max'
          view_count: number
          likes_count: number
          comments_count: number
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          content_type: 'blog' | 'youtube'
          body?: string | null
          youtube_url?: string | null
          youtube_id?: string | null
          thumbnail_url?: string | null
          access_tier?: 'free' | 'basic' | 'pro' | 'max'
          view_count?: number
          likes_count?: number
          comments_count?: number
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          content_type?: 'blog' | 'youtube'
          body?: string | null
          youtube_url?: string | null
          youtube_id?: string | null
          thumbnail_url?: string | null
          access_tier?: 'free' | 'basic' | 'pro' | 'max'
          view_count?: number
          likes_count?: number
          comments_count?: number
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          author_id: string
          target_type: 'free_post' | 'content'
          target_id: string
          parent_id: string | null
          content: string
          likes_count: number
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          target_type: 'free_post' | 'content'
          target_id: string
          parent_id?: string | null
          content: string
          likes_count?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          target_type?: 'free_post' | 'content'
          target_id?: string
          parent_id?: string | null
          content?: string
          likes_count?: number
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          target_type: 'free_post' | 'content' | 'comment'
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: 'free_post' | 'content' | 'comment'
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: 'free_post' | 'content' | 'comment'
          target_id?: string
          created_at?: string
        }
      }
      page_views: {
        Row: {
          id: string
          path: string
          page_title: string | null
          referrer: string | null
          user_agent: string | null
          device_type: 'mobile' | 'desktop' | 'tablet' | null
          country: string | null
          session_id: string | null
          visitor_id: string | null
          user_id: string | null
          is_new_visitor: boolean
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          path: string
          page_title?: string | null
          referrer?: string | null
          user_agent?: string | null
          device_type?: 'mobile' | 'desktop' | 'tablet' | null
          country?: string | null
          session_id?: string | null
          visitor_id?: string | null
          user_id?: string | null
          is_new_visitor?: boolean
          duration?: number
          created_at?: string
        }
        Update: {
          id?: string
          path?: string
          page_title?: string | null
          referrer?: string | null
          user_agent?: string | null
          device_type?: 'mobile' | 'desktop' | 'tablet' | null
          country?: string | null
          session_id?: string | null
          visitor_id?: string | null
          user_id?: string | null
          is_new_visitor?: boolean
          duration?: number
          created_at?: string
        }
      }
    }
  }
}
