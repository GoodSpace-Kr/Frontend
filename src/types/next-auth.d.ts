import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string; // 소셜 플랫폼 토큰
    provider?: string;
    backendAccessToken?: string; // 백엔드 JWT 토큰
    backendRefreshToken?: string; // 백엔드 리프레시 토큰
    backendUser?: unknown; // 백엔드 사용자 정보
  }

  interface User extends DefaultUser {
    backendAccessToken?: string;
    backendRefreshToken?: string;
    backendUser?: unknown;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string; // 소셜 플랫폼 토큰
    provider?: string;
    backendAccessToken?: string; // 백엔드 JWT 토큰
    backendRefreshToken?: string; // 백엔드 리프레시 토큰
    backendUser?: unknown; // 백엔드 사용자 정보
  }
}
