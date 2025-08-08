// types/auth.ts

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  provider?: string;
}

// 스웨거 스펙에 맞게 clientId 제거
export interface SocialCallbackRequest {
  code: string;
  // clientId 제거됨
}

export interface SocialProvider {
  name: string;
  color: string;
  textColor: string;
}

export interface LoginIconsProps {
  clientId?: string | null;
}
