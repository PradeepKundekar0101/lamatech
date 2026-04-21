export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      reports: {
        Row: {
          author: string;
          body: string;
          category: Database["public"]["Enums"]["report_category"];
          created_at: string;
          id: string;
          status: Database["public"]["Enums"]["report_status"];
          summary: string;
          tags: string[];
          title: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          author: string;
          body: string;
          category: Database["public"]["Enums"]["report_category"];
          created_at?: string;
          id: string;
          status: Database["public"]["Enums"]["report_status"];
          summary: string;
          tags?: string[];
          title: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          author?: string;
          body?: string;
          category?: Database["public"]["Enums"]["report_category"];
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["report_status"];
          summary?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      report_category:
        | "growth"
        | "engineering"
        | "finance"
        | "product"
        | "research";
      report_status: "draft" | "in_review" | "published" | "archived";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
