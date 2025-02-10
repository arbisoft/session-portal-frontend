export type LoginResponse = {
  access: string | null;
  refresh: string | null;
  user_info: {
    avatar: string | null;
    first_name: string | null;
    full_name: string | null;
    last_name: string | null;
  };
};

export type LoginParams = { auth_token: string };
