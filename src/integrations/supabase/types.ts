export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      interaction_history: {
        Row: {
          communication_type: Database["public"]["Enums"]["communication_type"]
          completed_at: string | null
          content: string | null
          created_at: string | null
          id: string
          lead_id: string
          outcome: string | null
          scheduled_for: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          communication_type: Database["public"]["Enums"]["communication_type"]
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          outcome?: string | null
          scheduled_for?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          communication_type?: Database["public"]["Enums"]["communication_type"]
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          outcome?: string | null
          scheduled_for?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interaction_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interaction_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          behavior_score: number | null
          calculated_at: string | null
          id: string
          interaction_score: number | null
          lead_id: string
          source_score: number | null
          timing_score: number | null
          total_score: number | null
        }
        Insert: {
          behavior_score?: number | null
          calculated_at?: string | null
          id?: string
          interaction_score?: number | null
          lead_id: string
          source_score?: number | null
          timing_score?: number | null
          total_score?: number | null
        }
        Update: {
          behavior_score?: number | null
          calculated_at?: string | null
          id?: string
          interaction_score?: number | null
          lead_id?: string
          source_score?: number | null
          timing_score?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string | null
          id: string
          name: string
          quality_score: number | null
          source_type: Database["public"]["Enums"]["lead_source"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          quality_score?: number | null
          source_type: Database["public"]["Enums"]["lead_source"]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          quality_score?: number | null
          source_type?: Database["public"]["Enums"]["lead_source"]
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string | null
          customer_id: string
          financing_needed: boolean | null
          id: string
          journey_stage: string | null
          last_contact: string | null
          lead_source_id: string | null
          next_follow_up: string | null
          notes: string | null
          priority_score: number | null
          response_time_minutes: number | null
          status: Database["public"]["Enums"]["lead_status"] | null
          temperature: Database["public"]["Enums"]["lead_temperature"] | null
          trade_in_vehicle: string | null
          updated_at: string | null
          vehicle_interest: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          customer_id: string
          financing_needed?: boolean | null
          id?: string
          journey_stage?: string | null
          last_contact?: string | null
          lead_source_id?: string | null
          next_follow_up?: string | null
          notes?: string | null
          priority_score?: number | null
          response_time_minutes?: number | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          trade_in_vehicle?: string | null
          updated_at?: string | null
          vehicle_interest?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string | null
          customer_id?: string
          financing_needed?: boolean | null
          id?: string
          journey_stage?: string | null
          last_contact?: string | null
          lead_source_id?: string | null
          next_follow_up?: string | null
          notes?: string | null
          priority_score?: number | null
          response_time_minutes?: number | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          trade_in_vehicle?: string | null
          updated_at?: string | null
          vehicle_interest?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          direction: string
          id: string
          lead_id: string
          message_type: string
          status: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          direction: string
          id?: string
          lead_id: string
          message_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          direction?: string
          id?: string
          lead_id?: string
          message_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          is_urgent: boolean | null
          lead_id: string | null
          message: string | null
          suggested_response: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          lead_id?: string | null
          message?: string | null
          suggested_response?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          lead_id?: string | null
          message?: string | null
          suggested_response?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          priority: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_priority_score: {
        Args: { lead_row: Database["public"]["Tables"]["leads"]["Row"] }
        Returns: number
      }
    }
    Enums: {
      communication_type: "call" | "email" | "text" | "in_person" | "other"
      lead_source:
        | "website"
        | "phone"
        | "email"
        | "walk_in"
        | "referral"
        | "social_media"
        | "advertising"
        | "trade_show"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "appointment_set"
        | "test_drive"
        | "proposal"
        | "negotiation"
        | "sold"
        | "lost"
        | "follow_up"
      lead_temperature: "hot" | "warm" | "cold"
      notification_type:
        | "new_lead"
        | "hot_lead_update"
        | "task_due"
        | "response_needed"
        | "follow_up_reminder"
      task_status: "pending" | "completed" | "overdue" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      communication_type: ["call", "email", "text", "in_person", "other"],
      lead_source: [
        "website",
        "phone",
        "email",
        "walk_in",
        "referral",
        "social_media",
        "advertising",
        "trade_show",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "appointment_set",
        "test_drive",
        "proposal",
        "negotiation",
        "sold",
        "lost",
        "follow_up",
      ],
      lead_temperature: ["hot", "warm", "cold"],
      notification_type: [
        "new_lead",
        "hot_lead_update",
        "task_due",
        "response_needed",
        "follow_up_reminder",
      ],
      task_status: ["pending", "completed", "overdue", "cancelled"],
    },
  },
} as const
