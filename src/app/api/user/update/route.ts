// app/api/user/update/route.ts

import { NextRequest, NextResponse } from "next/server";

// 요청 데이터 타입 정의
interface UpdateUserRequest {
  email: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  contactNumber1: string;
  contactNumber2: string;
  recipient: string;
  address: string;
  detailedAddress: string;
  postalCode: string;
}

// 에러 응답 타입 정의
interface ErrorResponse {
  error: string;
  details?: string;
  status?: number;
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  console.log("=== API Route 시작 ===");

  try {
    const body: UpdateUserRequest = await request.json();

    // 백엔드 API URL
    const backendUrl: string = process.env.BACKEND_API_URL || "http://13.209.4.64:8080";
    const fullUrl = `${backendUrl}/user/updateMyPage`;

    console.log("백엔드 요청 정보:");
    console.log("- URL:", fullUrl);
    console.log("- Method: PATCH");
    console.log("- Headers:", {
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") || "None",
    });
    console.log("- Body:", JSON.stringify(body, null, 2));

    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // 클라이언트에서 받은 Authorization 헤더가 있다면 전달
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization") as string,
        }),
      },
      body: JSON.stringify(body),
    });

    console.log("백엔드 응답 정보:");
    console.log("- Status:", response.status);
    console.log("- Status Text:", response.statusText);
    console.log("- Headers:", Object.fromEntries(response.headers.entries()));

    // 백엔드 응답 상태 코드 확인
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorText: string;

      console.log("에러 응답 Content-Type:", contentType);

      if (contentType && contentType.includes("application/json")) {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson, null, 2);
        console.error("백엔드 에러 (JSON):", errorJson);
      } else {
        errorText = await response.text();
        console.error("백엔드 에러 (Text):", errorText);
      }

      console.error(`백엔드 HTTP ${response.status} 에러:`, errorText);

      const errorResponse: ErrorResponse = {
        error: "백엔드 서버 오류",
        details: errorText,
        status: response.status,
      };

      return NextResponse.json(errorResponse, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // 백엔드에서 성공 응답 받음
    const result: string = await response.text();
    console.log("백엔드 성공 응답:", result);
    console.log("=== API Route 성공 완료 ===");

    return new NextResponse(result, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: unknown) {
    console.error("=== API Route 에러 ===");
    console.error("에러 객체:", error);
    console.error("에러 스택:", error instanceof Error ? error.stack : "No stack available");

    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("네트워크 에러: 백엔드 서버에 연결할 수 없습니다.");
      console.error("백엔드 URL:", process.env.BACKEND_API_URL);
    }

    const errorMessage: string = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("최종 에러 메시지:", errorMessage);

    const errorResponse: ErrorResponse = {
      error: "서버 내부 오류",
      details: errorMessage,
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
}

// CORS 프리플라이트 요청 처리
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
