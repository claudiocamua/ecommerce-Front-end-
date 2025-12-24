import "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    user: {
      id?: string;
      email?: string;
      full_name?: string;
      name?: string;
      image?: string;
      is_active?: boolean;
      is_verified?: boolean;
    };
  }

  interface User {
    backendToken?: string;
    userData?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    userData?: any;
  }
}