// middleware.ts (프로젝트 루트에 생성)
import { NextRequest, NextResponse } from "next/server";

// JWT 토큰 유효성 검사 함수 (미들웨어 내부에 포함)
function isValidToken({ accesstoken, refreshtoken }: { accesstoken?: string; refreshtoken?: string }): {
  isAccessTokenValid?: boolean;
  isRefreshTokenValid?: boolean;
} {
  const currentTime = Math.floor(Date.now() / 1000);

  const result: {
    isAccessTokenValid?: boolean;
    isRefreshTokenValid?: boolean;
  } = {};

  try {
    if (accesstoken) {
      const accessTokenPayload = JSON.parse(atob(accesstoken.split(".")[1]));
      result.isAccessTokenValid = accessTokenPayload.exp > currentTime;
      console.log("🔍 Access Token 만료 시간:", new Date(accessTokenPayload.exp * 1000));
      console.log("🔍 현재 시간:", new Date(currentTime * 1000));
      console.log("🔍 Access Token 유효:", result.isAccessTokenValid);
    }

    if (refreshtoken) {
      const refreshTokenPayload = JSON.parse(atob(refreshtoken.split(".")[1]));
      result.isRefreshTokenValid = refreshTokenPayload.exp > currentTime;
      console.log("🔍 Refresh Token 만료 시간:", new Date(refreshTokenPayload.exp * 1000));
      console.log("🔍 Refresh Token 유효:", result.isRefreshTokenValid);
    }
  } catch (error) {
    console.error("❌ 토큰 디코딩 실패:", error);
  }

  return result;
}

export async function middleware(request: NextRequest) {
  console.log("🔥 미들웨어 실행됨:", request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // afterLogin 그룹의 모든 경로를 보호
  const isAfterLoginRoute =
    pathname.startsWith("/main") ||
    pathname.startsWith("/mypage") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/servicecenter") ||
    pathname.startsWith("/shoppingcart") ||
    pathname.startsWith("/editpage") ||
    pathname.startsWith("/inquiry") ||
    pathname.startsWith("/inquirycheck") ||
    pathname.startsWith("/inquiryedit") ||
    pathname.startsWith("/inquiryhistory") ||
    pathname.startsWith("/resultorder");

  console.log("🔍 isAfterLoginRoute:", isAfterLoginRoute, "for path:", pathname);

  if (!isAfterLoginRoute) {
    console.log("✅ 보호되지 않는 경로, 통과");
    return NextResponse.next();
  }

  // 쿠키에서 토큰 확인
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  console.log("🍪 Access Token 존재 여부:", !!accessToken?.value);
  console.log("🍪 Refresh Token 존재 여부:", !!refreshToken?.value);

  if (!accessToken?.value || !refreshToken?.value) {
    console.log("❌ 토큰 없음, 로그인 페이지로 리다이렉트");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 토큰의 유효성을 검사
  const { isAccessTokenValid, isRefreshTokenValid } = isValidToken({
    accesstoken: accessToken.value,
    refreshtoken: refreshToken.value,
  });

  if (!isRefreshTokenValid) {
    // 리프레시 토큰이 유효하지 않을 경우 로그인 페이지로 리다이렉트
    console.log("❌ Refresh Token 만료, 로그인 페이지로 리다이렉트");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (!isAccessTokenValid) {
    // 액세스 토큰이 유효하지 않을 경우 액세스 토큰을 재발급
    console.log("🔄 Access Token 만료, 재발급 시도");

    try {
      // 스웨거에 맞춰 엔드포인트 수정 - reissue 사용
      const response = await fetch(`${API_URL}/api/authorization/reissue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${refreshToken.value}`,
        },
        credentials: "include",
      });

      console.log("🔄 토큰 재발급 응답 상태:", response.status);

      if (!response.ok) {
        // 응답이 성공적이지 않으면 로그인 페이지로 리다이렉트
        console.log("❌ 토큰 재발급 실패, 로그인 페이지로 리다이렉트");
        const loginResponse = NextResponse.redirect(new URL("/login", request.url));
        loginResponse.cookies.delete("accessToken");
        loginResponse.cookies.delete("refreshToken");
        return loginResponse;
      }

      // 토큰 재발급 성공
      console.log("✅ 토큰 재발급 성공");
      const res = NextResponse.next();

      try {
        const tokenData = await response.json();
        if (tokenData.accessToken) {
          res.cookies.set("accessToken", tokenData.accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
        if (tokenData.refreshToken) {
          res.cookies.set("refreshToken", tokenData.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      } catch (jsonError) {
        console.error("❌ JSON 파싱 실패:", jsonError);
        const errorResponse = NextResponse.redirect(new URL("/login", request.url));
        errorResponse.cookies.delete("accessToken");
        errorResponse.cookies.delete("refreshToken");
        return errorResponse;
      }

      return res;
    } catch (error) {
      // 토큰 재발급 중 오류가 발생하면 콘솔에 출력하고 로그인 페이지로 리다이렉트
      console.error("❌ 액세스 토큰 재발급 중 오류 발생:", error);
      const errorResponse = NextResponse.redirect(new URL("/login", request.url));
      errorResponse.cookies.delete("accessToken");
      errorResponse.cookies.delete("refreshToken");
      return errorResponse;
    }
  }

  console.log("✅ 토큰 유효, 통과");
  return NextResponse.next();
}

export const config = {
  // afterLogin 그룹의 모든 경로에 대해 미들웨어 실행
  matcher: [
    "/main/:path*",
    "/mypage/:path*",
    "/product/:path*",
    "/order/:path*",
    "/servicecenter/:path*",
    "/shoppingcart/:path*",
    "/editpage/:path*",
    "/inquiry/:path*",
    "/inquirycheck/:path*",
    "/inquiryedit/:path*",
    "/inquiryhistory/:path*",
    "/resultorder/:path*",
  ],
};
