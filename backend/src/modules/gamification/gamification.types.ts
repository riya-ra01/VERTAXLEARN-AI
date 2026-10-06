export interface AwardPointsBody {
  userId: string;
  points: number;
  reason: string;
  referenceId?: string;
}

export interface CreateBadgeBody {
  name: string;
  description?: string;
  iconUrl?: string;
  condition?: Record<string, unknown>;
}

export interface PointsRow {
  id: string;
  user_id: string;
  total: number;
  updated_at: string;
}

export interface BadgeRow {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  condition: Record<string, unknown> | null;
  created_at: string;
}

export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}
