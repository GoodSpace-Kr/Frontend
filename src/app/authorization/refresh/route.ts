// app/api/authorization/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 refreshToken 가져오기
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 });
    }

    // 스웨거에 맞춰 백엔드 API 엔드포인트 변경 - reissue 사용
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/authorization/reissue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
    });

    if (!backendResponse.ok) {
      return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }

    const tokenData = await backendResponse.json();

    // 새로운 토큰들을 응답에 포함
    const response = NextResponse.json({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
    });

    // 쿠키에도 설정
    response.cookies.set("accessToken", tokenData.accessToken, {
      httpOnly: false, // 클라이언트에서 API 호출에 사용하기 위해
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("refreshToken", tokenData.refreshToken, {
      httpOnly: true, // 보안을 위해 서버에서만 접근
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
