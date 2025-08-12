import { NextRequest, NextResponse } from "next/server";

// 소셜 로그인 제공자별 설정
interface BaseOAuthConfig {
  authUrl: string;
  clientIdEnv: string;
  responseType: string;
}

interface GoogleOAuthConfig extends BaseOAuthConfig {
  scope: string;
}

type OAuthConfig = BaseOAuthConfig | GoogleOAuthConfig;

const OAUTH_CONFIG: Record<string, OAuthConfig> = {
  kakao: {
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    clientIdEnv: "NEXT_PUBLIC_KAKAO_REST_API_KEY",
    responseType: "code",
  },
  naver: {
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
    clientIdEnv: "NEXT_PUBLIC_NAVER_REST_API_KEY",
    responseType: "code",
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientIdEnv: "NEXT_PUBLIC_GOOGLE_REST_API_KEY",
    responseType: "code",
    scope: "email profile",
  },
  apple: {
    authUrl: "https://appleid.apple.com/auth/authorize",
    clientIdEnv: "NEXT_PUBLIC_APPLE_REST_API_KEY",
    responseType: "code",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  try {
    const provider = context.params.provider; // kakao, naver, google, apple

    console.log(`=== ${provider.toUpperCase()} 로그인 리다이렉션 API 호출 ===`);

    // 지원되는 provider 확인
    if (!OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG]) {
      console.error("지원되지 않는 provider:", provider);
      return NextResponse.json({ error: "지원되지 않는 소셜 로그인 제공자입니다." }, { status: 400 });
    }

    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    const clientId = process.env[config.clientIdEnv];

    // 환경변수에서 프론트엔드 URL 가져오기 (fallback으로 request.nextUrl.origin 사용)
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || request.nextUrl.origin;
    const redirectUri = `${frontendUrl}/authorization/${provider}/callback`;
    const state = Math.random().toString(36).substring(2, 15); // 랜덤 state 생성

    if (!clientId) {
      console.error(`${provider} Client ID가 환경변수에 설정되지 않음:`, config.clientIdEnv);
      return NextResponse.json({ error: `${provider} 클라이언트 ID가 설정되지 않았습니다.` }, { status: 500 });
    }

    // OAuth URL 생성
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append("response_type", config.responseType);
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);

    // Google의 경우 scope 추가
    if (provider === "google" && "scope" in config) {
      authUrl.searchParams.append("scope", config.scope);
    }

    console.log(`${provider} 로그인 URL:`, authUrl.toString());
    console.log("Client ID:", clientId);
    console.log("Redirect URI:", redirectUri);
    console.log("State:", state);

    // 소셜 로그인 페이지로 리다이렉트
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error(`${context?.params?.provider || "Unknown"} 로그인 리다이렉션 오류:`, error);
    return NextResponse.json({ error: "소셜 로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
