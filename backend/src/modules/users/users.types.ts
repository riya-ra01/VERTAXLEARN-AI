export interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}
