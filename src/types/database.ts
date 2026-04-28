export type ProfileRole = 'user' | 'admin';
export type MembershipStatus = 'pending' | 'approved' | 'rejected';
export type CommitmentStatus = 'interested' | 'confirmed' | 'dropped';
export type ProjectStatus = 'open' | 'unlocked' | 'closed' | 'coming_soon';
export type MediaType = 'image' | 'video' | 'youtube';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: ProfileRole;
  membership_status: MembershipStatus;
  created_at: string;
  updated_at?: string;
}

export interface MembershipRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  budget_range: string | null;
  buying_purpose: string | null;
  preferred_locations: string[] | null;
  buying_timeline: string | null;
  agreement_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface DiscountTier {
  min_units: number;
  discount_percentage: number;
}

export interface UnitConfig {
  type: string;
  size: string;
  price: string;
}

export interface Builder {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  past_performance: string | null;
  trust_score: number;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  project_name: string;
  builder_name: string;
  builder_id?: string | null;
  builder_logo?: string | null;
  location: string;
  base_price: number;
  discount_percentage: number;
  discount_tiers?: DiscountTier[];
  unit_configs?: UnitConfig[];
  google_map_url?: string | null;
  brochure_pdf?: string | null;
  project_video?: string | null;
  thumbnail_url?: string | null;
  commission_percentage?: number;
  minimum_members_required: number;
  current_members_joined: number;
  deal_deadline: string | null;
  description: string | null;
  additional_info?: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at?: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_type: MediaType;
  media_url: string;
  created_at: string;
}

export interface PoolMember {
  id: string;
  user_id: string;
  project_id: string;
  commitment_status: CommitmentStatus;
  joined_at: string;
  project?: Project;
}

export interface AdminNote {
  id: string;
  user_id: string;
  note: string;
  created_at: string;
}

export interface ProjectWithMedia extends Project {
  project_media?: ProjectMedia[];
}

export interface PoolMemberWithProject extends PoolMember {
  project: Project;
}
