import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NEXT_PUBLIC_NAVER_REST_API_KEY!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_REST_API_KEY!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login", // 커스텀 로그인 페이지
    error: "/auth/error", // 에러 페이지
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("=== signIn callback ===");
      console.log("User:", user);
      console.log("Account:", account);
      console.log("Profile:", profile);

      // 여기서 백엔드 API와 연동하여 사용자 정보를 처리할 수 있습니다
      try {
        if (account?.provider && account?.access_token) {
          // 백엔드 API에 토큰을 전송하여 사용자 정보를 저장하거나 검증
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/social-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: account.provider,
              accessToken: account.access_token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              },
              profile: profile,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // 백엔드에서 받은 추가 정보를 user 객체에 추가
            user.backendToken = data.token;
            return true;
          }
        }
        return true; // 백엔드 연동이 실패해도 로그인은 허용
      } catch (error) {
        console.error("Backend integration error:", error);
        return true; // 에러가 발생해도 로그인은 허용
      }
    },
    async jwt({ token, user, account }) {
      console.log("=== jwt callback ===");
      console.log("Token:", token);
      console.log("User:", user);
      console.log("Account:", account);

      // 처음 로그인할 때만 실행됩니다
      if (account && user) {
        token.accessToken = account.access_token; // 소셜 플랫폼 토큰
        token.provider = account.provider;
        token.backendAccessToken = user.backendAccessToken; // 백엔드 JWT 토큰
        token.backendRefreshToken = user.backendRefreshToken; // 백엔드 리프레시 토큰
        token.backendUser = user.backendUser; // 백엔드 사용자 정보
      }

      return token;
    },
    async session({ session, token }) {
      console.log("=== session callback ===");
      console.log("Session:", session);
      console.log("Token:", token);

      // 세션에 추가 정보를 포함시킵니다
      session.accessToken = token.accessToken; // 소셜 플랫폼 토큰 (필요시)
      session.provider = token.provider;
      session.backendAccessToken = token.backendAccessToken; // 백엔드 JWT 토큰
      session.backendRefreshToken = token.backendRefreshToken; // 백엔드 리프레시 토큰
      session.backendUser = token.backendUser; // 백엔드 사용자 정보

      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("=== redirect callback ===");
      console.log("URL:", url);
      console.log("BaseURL:", baseUrl);

      // 로그인 후 리다이렉트할 URL을 결정합니다
      // URL에 clientId가 있다면 메인 페이지로 전달
      const urlParams = new URL(url, baseUrl).searchParams;
      const clientId = urlParams.get("clientId");

      if (clientId) {
        return `${baseUrl}/main?clientId=${clientId}`;
      }

      // 기본적으로 메인 페이지로 리다이렉트
      return `${baseUrl}/main`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
