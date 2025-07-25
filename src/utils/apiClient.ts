// src/utils/apiClient.ts
import { TokenManager } from "./tokenManager";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiClient {
  private static baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

  /**
   * GET 요청
   */
  static async get(url: string, options: FetchOptions = {}): Promise<Response> {
    return this.authenticatedFetch(url, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST 요청
   */
  static async post(url: string, data?: unknown, options: FetchOptions = {}): Promise<Response> {
    return this.authenticatedFetch(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  static async put(url: string, data?: unknown, options: FetchOptions = {}): Promise<Response> {
    return this.authenticatedFetch(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  static async delete(url: string, options: FetchOptions = {}): Promise<Response> {
    return this.authenticatedFetch(url, {
      ...options,
      method: "DELETE",
    });
  }

  /**
   * 토큰 인증이 포함된 fetch 요청
   */
  private static async authenticatedFetch(url: string, options: FetchOptions = {}): Promise<Response> {
    // 클라이언트 사이드에서만 실행
    if (typeof window === "undefined") {
      throw new Error("ApiClient는 클라이언트 사이드에서만 사용 가능합니다.");
    }

    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    // 기본 헤더 설정
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // 액세스 토큰 추가
    const accessToken = TokenManager.getAccessToken();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const requestOptions: FetchOptions = {
      ...options,
      headers,
    };

    try {
      // 첫 번째 요청 시도
      let response = await fetch(fullUrl, requestOptions);

      // 401 에러 (토큰 만료)인 경우 토큰 재발급 시도
      if (response.status === 401) {
        console.log("토큰 만료 감지, 재발급 시도...");

        const newToken = await TokenManager.refreshAccessToken();

        if (newToken) {
          // 새 토큰으로 재요청
          headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(fullUrl, {
            ...requestOptions,
            headers,
          });
        } else {
          // 토큰 재발급 실패
          throw new Error("토큰 재발급 실패");
        }
      }

      return response;
    } catch (error) {
      console.error("API 요청 에러:", error);
      throw error;
    }
  }

  /**
   * JSON 응답을 파싱하는 헬퍼 메서드
   */
  static async getJson<T = unknown>(url: string, options?: FetchOptions): Promise<T> {
    const response = await this.get(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * POST 요청 후 JSON 응답 파싱
   */
  static async postJson<T = unknown>(url: string, data?: unknown, options?: FetchOptions): Promise<T> {
    const response = await this.post(url, data, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}
