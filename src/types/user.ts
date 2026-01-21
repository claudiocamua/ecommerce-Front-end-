export interface User {
  id: string;
  email: string;
  name?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}