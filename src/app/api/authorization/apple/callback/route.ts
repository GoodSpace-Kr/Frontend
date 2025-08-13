// app/api/authorization/apple/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API 애플 form_post 콜백 처리 시작 ===");

    // form_post로 받은 데이터 처리
    const formData = await request.formData();
    const code = formData.get("code") as string;
    const state = formData.get("state") as string;
    const user = formData.get("user") as string;
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
          <meta name="viewport" content="width=device-width, initial-scale=1">
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

    // 성공시 처리 HTML
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>애플 로그인 처리중</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
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
            width: 90%;
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
          <h2>🍎 애플 로그인 처리중...</h2>
          <p id="status">잠시만 기다려주세요.</p>
        </div>
        
        <script>
          console.log('=== API 애플 form_post 콜백 HTML 로드 ===');
          
          const authData = {
            code: "${code}",
            state: "${state}",
            user: ${user ? `"${user.replace(/"/g, '\\"')}"` : "null"},
            id_token: ${id_token ? `"${id_token}"` : "null"}
          };
          
          console.log('애플 form_post 콜백 데이터:', authData);
          
          async function processAppleLogin() {
            try {
              document.getElementById('status').textContent = '서버에서 토큰 발급 중...';
              
              const response = await fetch('/api/authorization/apple/web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: authData.code })
              });
              
              const data = await response.json();
              console.log('API 응답:', data);
              
              if (!response.ok) {
                throw new Error(data.message || '서버 오류');
              }
              
              if (data.accessToken) {
                document.getElementById('status').textContent = '로그인 성공! 이동 중...';
                
                // 토큰 저장
                localStorage.setItem('authData', JSON.stringify({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  user: data.user
                }));
                
                // 쿠키 저장
                const isSecure = location.protocol === 'https:';
                document.cookie = \`accessToken=\${data.accessToken};path=/;max-age=604800;SameSite=Lax\${isSecure ? ';Secure' : ''}\`;
                document.cookie = \`refreshToken=\${data.refreshToken};path=/;max-age=604800;SameSite=Lax\${isSecure ? ';Secure' : ''}\`;
                
                // clientId 처리
                const clientId = localStorage.getItem('pendingClientId');
                if (clientId) {
                  localStorage.removeItem('pendingClientId');
                }
                
                const redirectUrl = clientId ? \`/main?clientId=\${clientId}\` : '/main';
                
                setTimeout(() => {
                  window.location.href = redirectUrl;
                }, 1000);
                
              } else {
                throw new Error('토큰을 받지 못했습니다.');
              }
              
            } catch (error) {
              console.error('처리 오류:', error);
              document.getElementById('status').textContent = '오류: ' + error.message;
              setTimeout(() => {
                window.location.href = '/login';
              }, 3000);
            }
          }
          
          // 자동 실행
          processAppleLogin();
        </script>
      </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("API 애플 콜백 오류:", error);
    return new Response("서버 오류", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // GET 요청은 간단하게 로그인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/login", request.url));
}
