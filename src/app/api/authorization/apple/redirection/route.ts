import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("=== 애플 로그인 리다이렉트 시작 ===");

    const clientId = process.env.NEXT_PUBLIC_APPLE_REST_API_KEY;

    // 프론트엔드 URL 사용 (콜백은 프론트엔드로)
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTENDS_URL || "https://goodspace-xi.vercel.app";

    if (!clientId) {
      return NextResponse.json({ message: "애플 클라이언트 ID가 설정되지 않았습니다." }, { status: 500 });
    }

    // 애플 콜백은 프론트엔드 도메인으로 설정
    const redirectUri = `${frontendUrl}/api/authorization/apple/callback`;
    const state = Math.random().toString(36).substring(2, 15);

    console.log("프론트엔드 도메인:", frontendUrl);
    console.log("백엔드 API 도메인:", process.env.NEXT_PUBLIC_BASE_URL);
    console.log("애플 콜백 URL:", redirectUri);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "name email",
      response_mode: "form_post", // 애플 요구사항: name/email scope 사용시 필수
      state: state,
    });

    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;

    console.log("애플 인증 URL:", appleAuthUrl);

    return NextResponse.redirect(appleAuthUrl);
  } catch (error) {
    console.error("애플 리다이렉트 오류:", error);
    return NextResponse.json({ message: "애플 로그인 리다이렉트 중 오류가 발생했습니다." }, { status: 500 });
  }
}
