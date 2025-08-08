// src/utils/tokenManager.ts

// 쿠키 유틸리티 함수들
function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${
    process.env.NODE_ENV === "production" ? ";Secure" : ""
  }`;
}

function deleteCookie(name: string): void {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

export class TokenManager {
  // ✅ 수정: 반환 타입을 Promise<string | null>로 일치시킴
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * 리프레시 토큰으로 새로운 액세스 토큰 발급
   */
  static async refreshAccessToken(): Promise<string | null> {
    // 이미 토큰 재발급 중이면 동일한 Promise 반환 (중복 요청 방지)
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * 실제 서버에 요청하여 액세스 토큰 재발급
   */
  private static async performTokenRefresh(): Promise<string | null> {
    try {
      if (typeof window === "undefined") {
        return null;
      }

      // ✅ 수정: 쿠키에서도 리프레시 토큰 확인
      const refreshToken = localStorage.getItem("refreshToken") || getCookie("refreshToken");

      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      // ✅ 수정: 백엔드 서버 주소와 올바른 엔드포인트 사용
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/authorization/reissue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("토큰 재발급 실패");
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken; // ✅ 새 리프레시 토큰도 받을 수 있음

      if (!newAccessToken) {
        throw new Error("응답에 accessToken이 없습니다.");
      }

      // ✅ localStorage와 쿠키 모두 업데이트
      localStorage.setItem("accessToken", newAccessToken);
      setCookie("accessToken", newAccessToken, 7);

      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
        setCookie("refreshToken", newRefreshToken, 7);
      }

      return newAccessToken;
    } catch (error) {
      console.error("토큰 재발급 에러:", error);

      if (typeof window !== "undefined") {
        // ✅ localStorage와 쿠키 모두 정리
        this.clearTokens();
        window.location.href = "/login";
      }

      return null;
    }
  }

  /**
   * 액세스 토큰 가져오기 (localStorage 우선, 쿠키 보조)
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    // localStorage 우선, 없으면 쿠키에서 가져오기
    return localStorage.getItem("accessToken") || getCookie("accessToken");
  }

  /**
   * 리프레시 토큰 가져오기 (localStorage 우선, 쿠키 보조)
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    // localStorage 우선, 없으면 쿠키에서 가져오기
    return localStorage.getItem("refreshToken") || getCookie("refreshToken");
  }

  /**
   * 토큰 저장 (localStorage와 쿠키 모두)
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;

    // localStorage 저장
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // 쿠키 저장 (미들웨어 호환용)
    setCookie("accessToken", accessToken, 7);
    setCookie("refreshToken", refreshToken, 7);
  }

  /**
   * 토큰 제거 (로그아웃) - localStorage와 쿠키 모두
   */
  static clearTokens(): void {
    if (typeof window === "undefined") return;

    // localStorage 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 쿠키 제거
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
  }

  /**
   * 토큰이 존재하는지 확인
   */
  static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}
