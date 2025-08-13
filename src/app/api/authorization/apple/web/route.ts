import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    console.log("=== 애플 콜백 API 시작 ===");
    console.log("받은 코드:", code?.substring(0, 20) + "...");

    if (!code) {
      return NextResponse.json({ message: "인증 코드가 필요합니다." }, { status: 400 });
    }

    // 백엔드 API 서버 URL (기존 NEXT_PUBLIC_BASE_URL 사용)
    const backendBaseUrl = process.env.NEXT_PUBLIC_BASE_URL; // https://goodspace.duckdns.org/api

    if (!backendBaseUrl) {
      return NextResponse.json({ message: "백엔드 서버 설정 오류" }, { status: 500 });
    }

    // 백엔드 스웨거 API 호출
    const backendUrl = `${backendBaseUrl}/authorization/apple/web`;
    console.log("백엔드 요청 URL:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Vercel-Frontend/1.0",
        // CORS 헤더
        Origin: process.env.NEXT_PUBLIC_FRONTENDS_URL || "https://goodspace-xi.vercel.app",
      },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(30000),
    });

    console.log("백엔드 응답 상태:", backendResponse.status);
    console.log("백엔드 응답 헤더:", Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`백엔드 오류 (${backendResponse.status}):`, errorText);

      let errorMessage = "애플 인증 처리 중 오류가 발생했습니다.";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `서버 오류 (${backendResponse.status})`;
      }

      return NextResponse.json(
        {
          message: errorMessage,
          status: backendResponse.status,
          backendUrl: backendUrl, // 디버깅용
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log("백엔드 성공 응답:", {
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
    });

    // 스웨거 스펙에 맞는 응답 반환
    return NextResponse.json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user || null,
      message: "애플 로그인 성공",
    });
  } catch (error) {
    console.error("애플 콜백 API 오류:", error);

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ message: "백엔드 서버 응답 시간이 초과되었습니다." }, { status: 408 });
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
        backendUrl: process.env.NEXT_PUBLIC_BASE_URL,
      },
      { status: 500 }
    );
  }
}
