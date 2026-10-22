export type LoginResponse = {
  access: string | null;
  refresh: string | null;
  user_info: {
    avatar: string | null;
    first_name: string | null;
    full_name: string | null;
    last_name: string | null;
    is_staff: boolean;
  };
};

export type LoginParams = { auth_token: string };

export type UserRole = "admin" | "staff" | "user";

export type CurrentUser = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_staff: boolean;
};
