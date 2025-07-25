// app/api/authorization/sign-in/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 실제 백엔드 API에 로그인 요청 (스웨거 엔드포인트에 맞춰 수정)
    const authResponse = await fetch(`${process.env.BACKEND_API_URL}/authorization/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      return NextResponse.json({ error: "로그인에 실패했습니다." }, { status: 401 });
    }

    const authData = await authResponse.json();

    // 응답 생성
    const response = NextResponse.json({
      message: "로그인 성공",
      accessToken: authData.accessToken, // 클라이언트에서 localStorage용
      refreshToken: authData.refreshToken, // 클라이언트에서 localStorage용
    });

    // 쿠키 설정 (미들웨어에서 사용) - refresh route와 동일한 설정
    response.cookies.set("accessToken", authData.accessToken, {
      httpOnly: false, // 클라이언트에서도 접근 가능하도록
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15분
    });

    response.cookies.set("refreshToken", authData.refreshToken, {
      httpOnly: true, // 미들웨어에서만 사용
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7일
    });

    return response;
  } catch (error) {
    console.error("로그인 API 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
