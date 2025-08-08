import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 스웨거 스펙에 맞게 code만 받음
    const { code } = await request.json();

    console.log("=== 페이스북 콜백 API 시작 ===");
    console.log("받은 데이터:", { code: code?.substring(0, 20) + "..." });
    console.log("환경변수 BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);

    if (!code) {
      console.error("인증 코드가 없음");
      return NextResponse.json({ message: "인증 코드가 필요합니다." }, { status: 400 });
    }

    // 백엔드 서버 연결 테스트
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error("환경변수 NEXT_PUBLIC_BASE_URL이 설정되지 않음");
      return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
    }

    // 스웨거 스펙에 맞게 GET 요청으로 code만 query parameter로 전송
    const params = new URLSearchParams();
    params.append("code", code);

    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/authorization/facebook/web?${params.toString()}`;
    console.log("백엔드 요청 URL:", backendUrl);

    let backendResponse;
    try {
      // 백엔드 서버에 GET 요청으로 인증 코드 전송
      backendResponse = await fetch(backendUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "NextJS-Frontend/1.0",
          "Cache-Control": "no-cache",
        },
        // 타임아웃 설정
        signal: AbortSignal.timeout(15000), // 15초
      });
    } catch (fetchError) {
      console.error("백엔드 요청 실패:", fetchError);
      if (fetchError instanceof Error && fetchError.name === "TimeoutError") {
        return NextResponse.json({ message: "서버 응답 시간이 초과되었습니다." }, { status: 408 });
      }
      return NextResponse.json({ message: "백엔드 서버에 연결할 수 없습니다." }, { status: 502 });
    }

    console.log("백엔드 응답 상태:", backendResponse.status);
    console.log("백엔드 응답 헤더:", Object.fromEntries(backendResponse.headers.entries()));
    console.log("응답 Content-Type:", backendResponse.headers.get("content-type"));

    // 응답 내용 확인
    let responseText;
    try {
      responseText = await backendResponse.text();
      console.log("백엔드 원본 응답 길이:", responseText.length);
      console.log("백엔드 원본 응답 첫 300자:", responseText.substring(0, 300));
    } catch (textError) {
      console.error("응답 텍스트 읽기 실패:", textError);
      return NextResponse.json({ message: "서버 응답을 읽을 수 없습니다." }, { status: 502 });
    }

    // 403 에러 특별 처리
    if (backendResponse.status === 403) {
      console.error("403 Forbidden 에러 - 상세 정보:", {
        url: backendUrl,
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: Object.fromEntries(backendResponse.headers.entries()),
        responseBody: responseText,
      });

      return NextResponse.json(
        {
          message: "서버에서 접근을 거부했습니다. 백엔드 서버 설정을 확인해주세요.",
          details: {
            status: 403,
            url: backendUrl,
            responsePreview: responseText.substring(0, 200),
          },
        },
        { status: 403 }
      );
    }

    if (!backendResponse.ok) {
      console.error(`백엔드 오류 응답 (${backendResponse.status}):`, responseText);

      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = {
          message: `서버 오류 (${backendResponse.status}): ${responseText.substring(0, 100)}`,
        };
      }

      return NextResponse.json(
        {
          message: errorData.message || "페이스북 인증 처리 중 오류가 발생했습니다.",
          status: backendResponse.status,
          details: errorData,
        },
        { status: backendResponse.status }
      );
    }

    // 성공 응답이지만 내용이 비어있는 경우
    if (!responseText || responseText.trim() === "") {
      console.error("백엔드에서 빈 응답 반환");
      return NextResponse.json({ message: "서버에서 빈 응답을 반환했습니다." }, { status: 502 });
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("파싱된 데이터 구조:", Object.keys(data));
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("파싱 실패한 응답:", responseText);
      return NextResponse.json(
        {
          message: "서버 응답 형식이 올바르지 않습니다.",
          responsePreview: responseText.substring(0, 200),
        },
        { status: 502 }
      );
    }

    // 응답 데이터 검증
    if (!data.accessToken) {
      console.error("응답에 accessToken이 없음:", data);
      return NextResponse.json(
        {
          message: "서버에서 토큰을 반환하지 않았습니다.",
          receivedData: Object.keys(data),
        },
        { status: 502 }
      );
    }

    console.log("백엔드에서 받은 성공 응답:", {
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
      userInfo: data.user ? { id: data.user.id, name: data.user.name } : "사용자 정보 없음",
      allKeys: Object.keys(data),
    });

    // JWT 토큰과 함께 성공 응답
    return NextResponse.json({
      message: "페이스북 로그인 성공",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
  } catch (error) {
    console.error("페이스북 콜백 API 최상위 오류:", error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
        error:
          process.env.NODE_ENV === "development"
            ? {
                name: error instanceof Error ? error.name : "Unknown",
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
