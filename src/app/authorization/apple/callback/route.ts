// app/authorization/apple/callback/route.ts (새로 생성 - form_post 처리용)
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== 애플 form_post 콜백 처리 시작 ===");

    // form_post로 받은 데이터 처리
    const formData = await request.formData();
    const code = formData.get("code") as string;
    const state = formData.get("state") as string;
    const user = formData.get("user") as string; // 사용자 정보 (첫 로그인시에만)
    const id_token = formData.get("id_token") as string;
    const error = formData.get("error") as string;

    console.log("받은 form_post 데이터:", {
      code: code?.substring(0, 20) + "..." || null,
      state,
      hasUser: !!user,
      hasIdToken: !!id_token,
      error,
    });

    // 에러 처리
    if (error) {
      const errorDescription = formData.get("error_description") as string;
      console.error("애플 OAuth 에러:", error, errorDescription);

      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>로그인 실패</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            alert('애플 로그인이 취소되었습니다: ${errorDescription || error}');
            window.location.href = '/login';
          </script>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    if (!code) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>로그인 실패</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            alert('인증 코드를 받지 못했습니다.');
            window.location.href = '/login';
          </script>
        </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // 성공시 클라이언트 사이드에서 처리하도록 HTML 응답
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>애플 로그인 처리중</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f8f9fa;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            max-width: 400px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f1f3f4;
            border-top: 3px solid #000;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>애플 로그인 처리중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
        
        <script>
          // 받은 데이터를 저장하고 처리
          const authData = {
            code: "${code}",
            state: "${state}",
            user: ${user ? `"${user.replace(/"/g, '\\"')}"` : "null"},
            id_token: ${id_token ? `"${id_token}"` : "null"}
          };
          
          console.log('애플 form_post 콜백 데이터:', authData);
          
          // 프론트엔드 API로 데이터 전송
          fetch('/api/authorization/apple/web', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(authData)
          })
          .then(response => response.json())
          .then(data => {
            console.log('API 응답:', data);
            
            if (data.accessToken) {
              // 토큰 저장
              localStorage.setItem('authData', JSON.stringify({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: data.user
              }));
              
              // 쿠키에도 저장
              document.cookie = \`accessToken=\${data.accessToken};path=/;max-age=604800;SameSite=Lax\${location.protocol === 'https:' ? ';Secure' : ''}\`;
              document.cookie = \`refreshToken=\${data.refreshToken};path=/;max-age=604800;SameSite=Lax\${location.protocol === 'https:' ? ';Secure' : ''}\`;
              
              // clientId 확인하고 리다이렉트
              const clientId = localStorage.getItem('pendingClientId');
              localStorage.removeItem('pendingClientId');
              
              const redirectUrl = clientId ? \`/main?clientId=\${clientId}\` : '/main';
              
              alert('애플 로그인 성공!');
              window.location.href = redirectUrl;
            } else {
              throw new Error(data.message || '로그인 처리 중 오류가 발생했습니다.');
            }
          })
          .catch(error => {
            console.error('로그인 오류:', error);
            alert('로그인 처리 중 오류가 발생했습니다: ' + error.message);
            window.location.href = '/login';
          });
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("애플 form_post 콜백 오류:", error);

    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>로그인 오류</title>
        <meta charset="utf-8">
      </head>
      <body>
        <script>
          alert('로그인 처리 중 오류가 발생했습니다.');
          window.location.href = '/login';
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}

// GET 요청도 처리 (URL 파라미터로 올 수도 있음)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>로그인 실패</title>
        <meta charset="utf-8">
      </head>
      <body>
        <script>
          alert('애플 로그인이 취소되었습니다.');
          window.location.href = '/login';
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  if (code) {
    // GET으로 온 경우도 동일하게 처리
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>애플 로그인 처리중</title>
        <meta charset="utf-8">
      </head>
      <body>
        <script>
          // GET 파라미터 처리
          const urlParams = new URLSearchParams(window.location.search);
          const authData = {
            code: urlParams.get('code'),
            state: urlParams.get('state'),
            user: urlParams.get('user'),
            id_token: urlParams.get('id_token')
          };
          
          // API 호출 (위와 동일한 로직)
          fetch('/api/authorization/apple/web', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authData)
          })
          .then(response => response.json())
          .then(data => {
            if (data.accessToken) {
              localStorage.setItem('authData', JSON.stringify(data));
              alert('애플 로그인 성공!');
              window.location.href = '/main';
            } else {
              throw new Error(data.message);
            }
          })
          .catch(error => {
            alert('로그인 오류: ' + error.message);
            window.location.href = '/login';
          });
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // 파라미터가 없으면 로그인 페이지로
  return NextResponse.redirect(new URL("/login", request.url));
}

// 참고: app/api/authorization/apple/web/route.ts의 기존 POST 함수는 그대로 유지하고
// 위의 form_post 콜백 HTML에서 해당 API를 호출하게 됩니다.
