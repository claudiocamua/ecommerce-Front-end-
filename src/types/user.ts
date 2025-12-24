export interface User {
  _id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  oauth_provider?: string | null;
  oauth_id?: string | null;
  picture?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}