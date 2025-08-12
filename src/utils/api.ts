import { getSession } from "next-auth/react";

// 백엔드 API 호출을 위한 유틸리티 함수들

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * 백엔드 API를 호출하는 기본 함수
 * NextAuth 세션에서 백엔드 토큰을 자동으로 가져와서 헤더에 포함
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    // NextAuth 세션에서 백엔드 토큰 가져오기
    const session = await getSession();
    const backendToken = session?.backendAccessToken;

    if (!backendToken) {
      return {
        success: false,
        error: "인증 토큰이 없습니다. 다시 로그인해주세요.",
        status: 401,
      };
    }

    // API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API 호출 실패: ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    console.error("API 호출 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * GET 요청
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "GET" });
}

/**
 * POST 요청
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPost<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 요청
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPut<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiDelete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, { method: "DELETE" });
}

/**
 * 토큰 갱신 함수
 */
export async function refreshBackendToken(): Promise<ApiResponse> {
  try {
    const session = await getSession();
    const refreshToken = session?.backendRefreshToken;

    if (!refreshToken) {
      return {
        success: false,
        error: "리프레시 토큰이 없습니다.",
        status: 401,
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "토큰 갱신 실패",
        status: response.status,
      };
    }

    const data = await response.json();

    // TODO: NextAuth 세션에 새로운 토큰 업데이트 로직 필요
    // 이 부분은 NextAuth의 update 함수를 사용하거나
    // 별도의 상태 관리가 필요할 수 있습니다.

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("토큰 갱신 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "토큰 갱신 중 오류가 발생했습니다.",
    };
  }
}

// 사용 예시:
/*
import { apiGet, apiPost } from '@/utils/api';

// 사용자 정보 조회
const userResponse = await apiGet('/users/me');
if (userResponse.success) {
  console.log('사용자 정보:', userResponse.data);
} else {
  console.error('오류:', userResponse.error);
}

// 데이터 전송
const createResponse = await apiPost('/users', { name: '홍길동' });
if (createResponse.success) {
  console.log('생성 완료:', createResponse.data);
}
*/
