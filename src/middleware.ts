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
  console.log("🔥 전체 URL:", request.url);

  const { pathname } = request.nextUrl;

  // 백엔드 API 서버 주소 설정
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://goodspace.duckdns.org/api";
  console.log("🔧 사용할 API URL:", API_URL);

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

  // 모든 쿠키 출력
  console.log("🍪 모든 쿠키:", request.cookies.getAll());

  // 쿠키에서 토큰 확인
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  console.log("🍪 쿠키 상태 상세:", {
    accessTokenExists: !!accessToken?.value,
    refreshTokenExists: !!refreshToken?.value,
    accessTokenLength: accessToken?.value?.length,
    refreshTokenLength: refreshToken?.value?.length,
    accessTokenStart: accessToken?.value?.substring(0, 50),
    refreshTokenStart: refreshToken?.value?.substring(0, 50),
  });

  // 쿠키에 토큰이 없으면 Authorization 헤더 확인
  let finalAccessToken = accessToken?.value;
  const finalRefreshToken = refreshToken?.value;

  if (!finalAccessToken || !finalRefreshToken) {
    const authHeader = request.headers.get("authorization");
    console.log("🔍 Authorization 헤더:", authHeader);
    if (authHeader && authHeader.startsWith("Bearer ")) {
      finalAccessToken = authHeader.substring(7);
      console.log("🔍 Authorization 헤더에서 토큰 발견");
    }
  }

  console.log("🔍 최종 토큰 상태:", {
    finalAccessTokenExists: !!finalAccessToken,
    finalRefreshTokenExists: !!finalRefreshToken,
    finalAccessTokenLength: finalAccessToken?.length,
    finalRefreshTokenLength: finalRefreshToken?.length,
  });

  if (!finalAccessToken || !finalRefreshToken) {
    console.log("❌ 토큰 없음, 로그인 페이지로 리다이렉트");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    console.log("❌ 리다이렉트 URL:", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // 토큰의 유효성을 검사
  console.log("🔍 토큰 유효성 검사 시작...");
  const { isAccessTokenValid, isRefreshTokenValid } = isValidToken({
    accesstoken: finalAccessToken,
    refreshtoken: finalRefreshToken,
  });

  console.log("🔍 토큰 유효성 결과:", {
    isAccessTokenValid,
    isRefreshTokenValid,
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
      console.log("🔄 재발급 API 호출:", `${API_URL}/authorization/reissue`);
      console.log("🔄 사용할 Refresh Token:", finalRefreshToken?.substring(0, 50) + "...");

      const reissueResponse = await fetch(`${API_URL}/authorization/reissue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${finalRefreshToken}`,
          "User-Agent": "NextJS-Middleware",
        },
        credentials: "include",
      });

      console.log("🔄 토큰 재발급 응답 상태:", reissueResponse.status);
      console.log("🔄 토큰 재발급 응답 헤더:", Object.fromEntries(reissueResponse.headers.entries()));

      if (!reissueResponse.ok) {
        const errorText = await reissueResponse.text();
        console.log("❌ 토큰 재발급 실패 응답:", errorText);
        const loginResponse = NextResponse.redirect(new URL("/login", request.url));
        loginResponse.cookies.delete("accessToken");
        loginResponse.cookies.delete("refreshToken");
        return loginResponse;
      }

      // 토큰 재발급 성공
      console.log("✅ 토큰 재발급 성공");
      const res = NextResponse.next();

      try {
        const responseText = await reissueResponse.text();
        console.log("🔄 재발급 응답 본문:", responseText);

        const tokenData = JSON.parse(responseText);
        console.log("🔄 파싱된 토큰 데이터 키:", Object.keys(tokenData));

        if (tokenData.accessToken) {
          res.cookies.set("accessToken", tokenData.accessToken, {
            httpOnly: false, // 프론트엔드에서도 접근 가능하도록 설정
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7일
          });
          console.log("✅ 새로운 Access Token 쿠키 설정 완료");
        }
        if (tokenData.refreshToken) {
          res.cookies.set("refreshToken", tokenData.refreshToken, {
            httpOnly: true, // 보안을 위해 httpOnly 유지
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7일
          });
          console.log("✅ 새로운 Refresh Token 쿠키 설정 완료");
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
      console.error("❌ 액세스 토큰 재발급 중 오류 발생:", error);
      console.error("❌ 오류 상세:", error instanceof Error ? error.message : String(error));

      // 네트워크 오류일 경우 일단 통과시키기 (임시 방편)
      if (error instanceof Error && error.message.includes("fetch")) {
        console.log("⚠️ 네트워크 오류로 인해 임시로 통과시킴");
        return NextResponse.next();
      }

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
