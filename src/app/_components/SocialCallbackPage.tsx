"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { storeAuthData, clearAuthData } from "../../utils/auth";
import type { SocialProvider } from "../../types/auth";

const PROVIDERS: Record<string, SocialProvider> = {
  kakao: { name: "카카오", color: "#FEE500", textColor: "#000" },
  naver: { name: "네이버", color: "#03C75A", textColor: "#fff" },
  google: { name: "구글", color: "#4285f4", textColor: "#fff" },
  facebook: { name: "페이스북", color: "#1877f2", textColor: "#fff" },
  apple: { name: "애플", color: "#000", textColor: "#fff" },
};

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

  // 🔧 유연한 provider 추출 함수
  const extractProvider = (pathname: string): string => {
    const parts = pathname.split("/").filter((part) => part !== "");
    console.log("Path parts:", parts);

    // authorization 다음에 오는 부분을 찾기
    const authIndex = parts.indexOf("authorization");
    if (authIndex !== -1 && authIndex + 1 < parts.length) {
      const provider = parts[authIndex + 1];
      console.log("Found provider:", provider);
      return provider;
    }

    // fallback: PROVIDERS에 있는 키 중에서 찾기
    const knownProviders = Object.keys(PROVIDERS);
    for (const part of parts) {
      if (knownProviders.includes(part)) {
        console.log("Found provider via fallback:", part);
        return part;
      }
    }

    console.log("No provider found, defaulting to kakao");
    return "kakao";
  };

  // 소셜 로그인 성공 후 리다이렉트 처리 함수
  const handleRedirectAfterSocialLogin = () => {
    console.log("=== 소셜 로그인 성공 후 리다이렉트 처리 ===");

    // localStorage에서 저장된 정보들을 가져옴
    const pendingClientId = localStorage.getItem("pendingClientId");
    const pendingProductInfoStr = localStorage.getItem("pendingProductInfo");

    console.log("저장된 clientId:", pendingClientId);
    console.log("저장된 상품 정보:", pendingProductInfoStr);

    let pendingProductInfo = null;
    try {
      if (pendingProductInfoStr) {
        pendingProductInfo = JSON.parse(pendingProductInfoStr);
      }
    } catch (error) {
      console.error("상품 정보 파싱 오류:", error);
    }

    // localStorage 정리
    localStorage.removeItem("pendingClientId");
    localStorage.removeItem("pendingProductInfo");

    // 리다이렉트 처리
    if (pendingProductInfo && pendingProductInfo.redirectPath === "/product") {
      // 상품 상세페이지로 리다이렉트
      const productParams = new URLSearchParams();
      if (pendingProductInfo.clientId) {
        productParams.append("clientId", pendingProductInfo.clientId);
      }
      if (pendingProductInfo.itemId) {
        productParams.append("itemId", pendingProductInfo.itemId);
      }
      if (pendingProductInfo.images) {
        productParams.append("images", pendingProductInfo.images);
      }

      const redirectUrl = `/product?${productParams.toString()}`;
      console.log("상품 페이지로 리다이렉트:", redirectUrl);

      setTimeout(() => router.push(redirectUrl), 2000);
    } else if (pendingClientId) {
      // 클라이언트 메인 페이지로 리다이렉트
      const redirectUrl = `/main?clientId=${pendingClientId}`;
      console.log("클라이언트 메인 페이지로 리다이렉트:", redirectUrl);

      setTimeout(() => router.push(redirectUrl), 2000);
    } else {
      // 기본 메인 페이지로 리다이렉트
      console.log("메인 페이지로 리다이렉트");

      setTimeout(() => router.push("/main"), 2000);
    }
  };

  const provider = extractProvider(pathname) as keyof typeof PROVIDERS;
  const providerInfo = PROVIDERS[provider] || PROVIDERS.kakao;

  console.log("=== Provider 추출 결과 ===");
  console.log("pathname:", pathname);
  console.log("extracted provider:", provider);
  console.log("providerInfo:", providerInfo);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log(`=== ${providerInfo.name} 콜백 처리 시작 ===`);

        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const state = searchParams.get("state");

        const debugData = {
          url: window.location.href,
          pathname,
          provider,
          providerName: providerInfo.name,
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
          setError(errorMsg);
          setStatus("로그인 실패");
          setTimeout(() => router.push("/login"), 5000);
          return;
        }

        if (!code) {
          setError("인증 코드를 받지 못했습니다.");
          setStatus("로그인 실패");
          setTimeout(() => router.push("/login"), 5000);
          return;
        }

        setStatus("서버에서 토큰 발급 중...");

        // 애플과 다른 소셜 로그인 구분
        let apiUrl;
        if (provider === "apple") {
          // 애플: 프론트엔드 API 경유
          apiUrl = `/api/authorization/${provider}/web`;
        } else {
          // 다른 소셜: 직접 백엔드 호출
          apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/authorization/${provider}/web`;
        }

        console.log("API 호출 URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        console.log("API 응답 상태:", response.status);

        const data = await response.json();
        console.log("서버 응답:", data);

        if (!response.ok) {
          throw new Error(data.message || "로그인 처리 중 오류가 발생했습니다.");
        }

        setStatus("로그인 성공! 토큰 저장 중...");

        // 스웨거 응답 구조에 맞게 토큰 저장
        storeAuthData({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user || null, // 백엔드에서 사용자 정보도 포함할 수 있음
        });

        // 쿠키에도 토큰 저장
        if (data.accessToken && data.refreshToken) {
          setCookie("accessToken", data.accessToken, 7);
          setCookie("refreshToken", data.refreshToken, 7);
        }

        setStatus("로그인 성공! 페이지로 이동합니다...");

        // 상품 정보를 고려한 리다이렉트 처리
        handleRedirectAfterSocialLogin();
      } catch (error) {
        console.error(`${providerInfo.name} 로그인 오류:`, error);
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        setStatus("로그인 실패");
        clearAuthData();
        setTimeout(() => router.push("/login"), 5000);
      }
    };

    handleCallback();
  }, [router, searchParams, provider, providerInfo.name, pathname]);

  // 나머지 JSX는 기존과 동일...
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
              <p style={{ color: "#721c24", fontSize: "14px", margin: "0" }}>⚠️ {error}</p>
            </div>
            <p
              style={{
                color: "#6c757d",
                fontSize: "12px",
                marginTop: "20px",
                fontStyle: "italic",
              }}
            >
              5초 후 로그인 페이지로 이동합니다...
            </p>
          </>
        )}

        {/* 개발환경 디버그 정보 */}
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

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocialCallbackContent />
    </Suspense>
  );
}
