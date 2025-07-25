// app/api/authorization/reissue/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 refreshToken 가져오기
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 });
    }

    // 스웨거에 맞춰 백엔드 API 호출
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/authorization/reissue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
    });

    if (!backendResponse.ok) {
      return NextResponse.json({ error: "Token reissue failed" }, { status: 401 });
    }

    const tokenData = await backendResponse.json();

    // 새로운 토큰들을 응답에 포함
    const response = NextResponse.json({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
    });

    // 쿠키에도 설정
    response.cookies.set("accessToken", tokenData.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("refreshToken", tokenData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token reissue error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
