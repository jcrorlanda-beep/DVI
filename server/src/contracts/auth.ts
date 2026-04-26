export type LoginRequest = {
  username: string;
  password: string;
  rememberDevice?: boolean;
};

export type SessionUserDto = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
  active: boolean;
};

export type LoginResponse = {
  user: SessionUserDto;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
};

export type RefreshResponse = {
  accessToken: string;
  expiresAt: string;
};

export type LogoutResponse = {
  loggedOut: boolean;
};
