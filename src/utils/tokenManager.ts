// src/utils/tokenManager.ts
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

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
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

      if (!newAccessToken) {
        throw new Error("응답에 accessToken이 없습니다.");
      }

      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("토큰 재발급 에러:", error);

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }

      return null;
    }
  }

  /**
   * 액세스 토큰 가져오기
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("accessToken");
  }

  /**
   * 토큰 제거 (로그아웃)
   */
  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
}
