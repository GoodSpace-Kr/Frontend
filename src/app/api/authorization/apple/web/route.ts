import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== 애플 콜백 API 시작 ===");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));

    // 요청 바디 디버깅
    const body = await request.text();
    console.log("Raw request body:", body);
    console.log("Body length:", body.length);

    let parsedData;
    try {
      parsedData = JSON.parse(body);
      console.log("Parsed data:", parsedData);
      console.log("Data keys:", Object.keys(parsedData));
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      return NextResponse.json(
        {
          message: "잘못된 JSON 형식",
          receivedBody: body,
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 }
      );
    }

    const { code } = parsedData;
    console.log("추출된 코드:", code?.substring(0, 20) + "...");
    console.log("코드 타입:", typeof code);
    console.log("코드 길이:", code?.length);

    if (!code) {
      console.error("❌ 코드가 없음!");
      console.log("받은 전체 데이터:", parsedData);
      return NextResponse.json(
        {
          message: "인증 코드가 필요합니다.",
          receivedData: parsedData,
          availableKeys: Object.keys(parsedData),
        },
        { status: 400 }
      );
    }

    // 환경변수 확인
    const backendBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    console.log("백엔드 URL:", backendBaseUrl);

    if (!backendBaseUrl) {
      console.error("❌ 백엔드 URL이 없음!");
      return NextResponse.json({ message: "백엔드 서버 설정 오류" }, { status: 500 });
    }

    // 백엔드 호출
    const backendUrl = `${backendBaseUrl}/authorization/apple/web`;
    console.log("👉 백엔드 요청 URL:", backendUrl);

    const requestBody = { code };
    console.log("👉 백엔드로 보낼 데이터:", requestBody);

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Vercel-Frontend/1.0",
        Origin: process.env.NEXT_PUBLIC_FRONTENDS_URL || "https://goodspace-xi.vercel.app",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });

    console.log("📥 백엔드 응답 상태:", backendResponse.status);
    console.log("📥 백엔드 응답 헤더:", Object.fromEntries(backendResponse.headers.entries()));

    // 백엔드 응답 처리
    const responseText = await backendResponse.text();
    console.log("📥 백엔드 원본 응답:", responseText.substring(0, 500) + "...");

    if (!backendResponse.ok) {
      console.error(`❌ 백엔드 오류 (${backendResponse.status})`);
      console.error("오류 내용:", responseText);

      let errorMessage = "애플 인증 처리 중 오류가 발생했습니다.";
      let errorData;

      try {
        errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
        console.log("파싱된 에러 데이터:", errorData);
      } catch (parseError) {
        console.log("에러 응답 JSON 파싱 실패:", parseError);
        errorMessage = `서버 오류 (${backendResponse.status}): ${responseText.substring(0, 100)}`;
      }

      return NextResponse.json(
        {
          message: errorMessage,
          status: backendResponse.status,
          backendUrl: backendUrl,
          backendError: responseText.substring(0, 500),
          errorData: errorData || null,
        },
        { status: backendResponse.status }
      );
    }

    // 성공 응답 처리
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ 백엔드 성공 응답 파싱됨");
      console.log("응답 키들:", Object.keys(data));
      console.log("토큰 여부:", {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        hasUser: !!data.user,
      });
    } catch (parseError) {
      console.error("❌ 성공 응답 JSON 파싱 실패:", parseError);
      return NextResponse.json(
        {
          message: "서버 응답 형식 오류",
          responseText: responseText.substring(0, 200),
        },
        { status: 502 }
      );
    }

    // 최종 응답
    const finalResponse = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user || null,
      message: "애플 로그인 성공",
    };

    console.log("✅ 최종 응답 준비됨:", {
      hasAccessToken: !!finalResponse.accessToken,
      hasRefreshToken: !!finalResponse.refreshToken,
      hasUser: !!finalResponse.user,
    });

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("❌ 애플 콜백 API 최상위 오류:", error);
    console.error("오류 스택:", error instanceof Error ? error.stack : "스택 없음");

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ message: "백엔드 서버 응답 시간이 초과되었습니다." }, { status: 408 });
    }

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
        errorType: error instanceof Error ? error.name : typeof error,
        backendUrl: process.env.NEXT_PUBLIC_BASE_URL,
        errorDetails:
          process.env.NODE_ENV === "development"
            ? {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
