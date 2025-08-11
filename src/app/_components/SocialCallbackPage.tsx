"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { storeAuthData, clearAuthData } from "../../utils/auth";
import type { SocialProvider } from "../../types/auth";

// 소셜 로그인 제공자 정보
const PROVIDERS: Record<string, SocialProvider> = {
  kakao: { name: "카카오", color: "#FEE500", textColor: "#000" },
  naver: { name: "네이버", color: "#03C75A", textColor: "#fff" },
  google: { name: "구글", color: "#4285f4", textColor: "#fff" },
  facebook: { name: "페이스북", color: "#1877f2", textColor: "#fff" },
  apple: { name: "애플", color: "#000", textColor: "#fff" },
};

// 쿠키 설정 헬퍼 함수
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${
    process.env.NODE_ENV === "production" ? ";Secure" : ""
  }`;
}

function SocialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [status, setStatus] = useState<string>("로그인 처리 중...");
  const [error, setError] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugInfo, setDebugInfo] = useState<any>({});

  // URL에서 제공자 추출 (예: /authorization/kakao/callback)
  const provider = pathname.split("/")[3] as keyof typeof PROVIDERS;
  const providerInfo = PROVIDERS[provider] || PROVIDERS.kakao;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log(`=== ${providerInfo.name} 콜백 처리 시작 ===`);
        console.log("현재 URL:", window.location.href);
        console.log("Provider:", provider);

        // URL에서 파라미터 추출
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const state = searchParams.get("state");

        const debugData = {
          url: window.location.href,
          provider,
          code: code?.substring(0, 20) + "..." || null,
          error,
          errorDescription,
          state,
          timestamp: new Date().toISOString(),
        };

        setDebugInfo(debugData);
        console.log("받은 파라미터:", debugData);

        if (error) {
          const errorMsg = errorDescription || `${providerInfo.name} 로그인이 취소되었습니다.`;
          console.error("OAuth 오류:", error, errorDescription);
          setError(errorMsg);
          setStatus("로그인 실패");
          setTimeout(() => router.push("/login"), 5000);
          return;
        }

        if (!code) {
          console.error("인증 코드가 없음");
          setError("인증 코드를 받지 못했습니다.");
          setStatus("로그인 실패");
          setTimeout(() => router.push("/login"), 5000);
          return;
        }

        setStatus("백엔드 서버 연결 중...");

        // localStorage에서 clientId 가져오기 (서버로는 보내지 않고 나중에 리다이렉트용으로만 사용)
        const clientId = localStorage.getItem("pendingClientId");
        console.log("저장된 clientId (리다이렉트용):", clientId);

        // 스웨거 스펙에 맞게 code만 서버로 전송
        const requestBody = {
          code: code,
        };

        console.log("API 요청 URL:", `/authorization/${provider}/web`);
        console.log("서버로 전송할 데이터:", requestBody);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/authorization/${provider}/web`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("프론트엔드 API 응답 상태:", response.status);
        console.log("응답 헤더:", Object.fromEntries(response.headers.entries()));

        // 응답이 JSON인지 확인
        const contentType = response.headers.get("content-type");
        console.log("응답 Content-Type:", contentType);

        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const textResponse = await response.text();
          console.log("비JSON 응답:", textResponse);
          throw new Error(`서버에서 JSON이 아닌 응답을 반환했습니다: ${textResponse.substring(0, 100)}`);
        }

        console.log("서버 응답 데이터:", data);

        if (!response.ok) {
          throw new Error(data.message || "로그인 처리 중 오류가 발생했습니다.");
        }

        setStatus("토큰 저장 중...");

        // JWT 토큰과 사용자 정보 저장 (localStorage)
        storeAuthData({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });

        // ✅ 추가: 미들웨어가 인식할 수 있도록 쿠키에도 토큰 저장
        if (data.accessToken && data.refreshToken) {
          console.log("쿠키에 토큰 저장 중...");
          setCookie("accessToken", data.accessToken, 7);
          setCookie("refreshToken", data.refreshToken, 7);
          console.log("쿠키 저장 완료");
        }

        // pendingClientId 제거
        localStorage.removeItem("pendingClientId");

        setStatus("로그인 성공! 메인 페이지로 이동합니다...");
        console.log("로그인 성공 - 리다이렉트 준비");

        // clientId는 프론트엔드에서만 관리하여 적절한 메인 페이지로 리다이렉트
        const redirectUrl = clientId ? `/main?clientId=${clientId}` : "/main";
        console.log("리다이렉트 URL:", redirectUrl);

        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);
      } catch (error) {
        console.error(`${providerInfo.name} 로그인 콜백 처리 오류:`, error);
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        setStatus("로그인 실패");

        // 인증 데이터 정리
        clearAuthData();

        // 5초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/login");
        }, 5000);
      }
    };

    handleCallback();
  }, [router, searchParams, provider, providerInfo.name]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          maxWidth: "500px",
          width: "100%",
          border: "1px solid #e9ecef",
        }}
      >
        <h2
          style={{
            color: "#212529",
            marginBottom: "24px",
            fontSize: "24px",
            fontWeight: "600",
            margin: "0 0 24px 0",
          }}
        >
          {providerInfo.name} 로그인
        </h2>

        {!error && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #f1f3f4",
                borderTop: `3px solid ${providerInfo.color}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
          </div>
        )}

        <p
          style={{
            color: error ? "#dc3545" : "#6c757d",
            fontSize: "16px",
            marginBottom: "16px",
            lineHeight: "1.5",
            margin: "0 0 16px 0",
          }}
        >
          {status}
        </p>

        {error && (
          <>
            <div
              style={{
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "16px",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  color: "#721c24",
                  fontSize: "14px",
                  margin: "0",
                  lineHeight: "1.4",
                }}
              >
                ⚠️ {error}
              </p>
            </div>
            <p
              style={{
                color: "#6c757d",
                fontSize: "12px",
                marginTop: "20px",
                fontStyle: "italic",
                margin: "20px 0 0 0",
              }}
            >
              5초 후 로그인 페이지로 이동합니다...
            </p>
          </>
        )}

        {/* 개발환경에서만 디버그 정보 표시 */}
        {process.env.NODE_ENV === "development" && Object.keys(debugInfo).length > 0 && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "12px",
              marginTop: "16px",
              textAlign: "left",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>디버그 정보:</h4>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {!error && (
          <div
            style={{
              backgroundColor: providerInfo.color,
              color: providerInfo.textColor,
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: "500",
              display: "inline-block",
              marginTop: "12px",
            }}
          >
            {providerInfo.name}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// Fallback 컴포넌트 (로딩 중일 때 표시)
function SocialCallbackFallback() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          maxWidth: "500px",
          width: "100%",
          border: "1px solid #e9ecef",
        }}
      >
        <h2
          style={{
            color: "#212529",
            marginBottom: "24px",
            fontSize: "24px",
            fontWeight: "600",
            margin: "0 0 24px 0",
          }}
        >
          소셜 로그인
        </h2>

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #f1f3f4",
              borderTop: "3px solid #6c757d",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
        </div>

        <p
          style={{
            color: "#6c757d",
            fontSize: "16px",
            marginBottom: "16px",
            lineHeight: "1.5",
            margin: "0 0 16px 0",
          }}
        >
          페이지를 로딩하고 있습니다...
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<SocialCallbackFallback />}>
      <SocialCallbackContent />
    </Suspense>
  );
}
