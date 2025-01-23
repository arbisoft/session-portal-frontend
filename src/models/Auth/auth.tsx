export type LoginResponse = {
  access: string;
  refresh: string;
  user_info: {
    avatar: string;
    first_name: string;
    full_name: string;
    last_name: string;
  };
};

export type LoginParams = { auth_token: string };
