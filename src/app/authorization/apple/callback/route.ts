// app/authorization/apple/callback/route.ts
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
         <meta name="viewport" content="width=device-width, initial-scale=1">
       </head>
       <body>
         <script>
           console.log('Apple 로그인 에러:', '${error}', '${errorDescription || error}');
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
         <meta name="viewport" content="width=device-width, initial-scale=1">
       </head>
       <body>
         <script>
           console.log('Apple 로그인 에러: 인증 코드 없음');
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
         .status {
           color: #6c757d;
           font-size: 16px;
           margin: 10px 0;
         }
         .error {
           color: #dc3545;
           background-color: #f8d7da;
           border: 1px solid #f5c6cb;
           border-radius: 8px;
           padding: 12px;
           margin: 10px 0;
         }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="spinner" id="spinner"></div>
         <h2>🍎 애플 로그인 처리중...</h2>
         <p class="status" id="status">잠시만 기다려주세요.</p>
         <div class="error" id="error" style="display: none;"></div>
       </div>
       
       <script>
         console.log('=== 애플 form_post 콜백 HTML 로드 ===');
         
         // 받은 데이터를 저장하고 처리
         const authData = {
           code: "${code}",
           state: "${state}",
           user: ${user ? `"${user.replace(/"/g, '\\"')}"` : "null"},
           id_token: ${id_token ? `"${id_token}"` : "null"}
         };
         
         console.log('애플 form_post 콜백 데이터:', authData);
         
         // UI 업데이트 함수
         function updateStatus(message, isError = false) {
           const statusEl = document.getElementById('status');
           const errorEl = document.getElementById('error');
           const spinnerEl = document.getElementById('spinner');
           
           if (isError) {
             statusEl.style.display = 'none';
             errorEl.style.display = 'block';
             errorEl.textContent = message;
             spinnerEl.style.display = 'none';
           } else {
             statusEl.textContent = message;
             errorEl.style.display = 'none';
           }
         }
         
         // API 호출 함수
         async function processAppleLogin() {
           try {
             updateStatus('서버에서 토큰 발급 중...');
             
             console.log('Apple API 호출 시작');
             
             // 프론트엔드 API로 데이터 전송
             const response = await fetch('/api/authorization/apple/web', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               body: JSON.stringify({ code: authData.code })
             });
             
             console.log('API 응답 상태:', response.status);
             
             const data = await response.json();
             console.log('API 응답 데이터:', {
               hasAccessToken: !!data.accessToken,
               hasRefreshToken: !!data.refreshToken,
               message: data.message
             });
             
             if (!response.ok) {
               throw new Error(data.message || '서버에서 오류가 발생했습니다.');
             }
             
             if (data.accessToken) {
               updateStatus('로그인 성공! 토큰 저장 중...');
               
               // 토큰 저장
               const authDataToStore = {
                 accessToken: data.accessToken,
                 refreshToken: data.refreshToken,
                 user: data.user
               };
               
               localStorage.setItem('authData', JSON.stringify(authDataToStore));
               console.log('토큰 localStorage 저장 완료');
               
               // 쿠키에도 저장
               const isSecure = location.protocol === 'https:';
               document.cookie = \`accessToken=\${data.accessToken};path=/;max-age=604800;SameSite=Lax\${isSecure ? ';Secure' : ''}\`;
               document.cookie = \`refreshToken=\${data.refreshToken};path=/;max-age=604800;SameSite=Lax\${isSecure ? ';Secure' : ''}\`;
               console.log('토큰 쿠키 저장 완료');
               
               // clientId 확인하고 리다이렉트
               const clientId = localStorage.getItem('pendingClientId');
               console.log('저장된 clientId:', clientId);
               
               if (clientId) {
                 localStorage.removeItem('pendingClientId');
                 console.log('pendingClientId 제거 완료');
               }
               
               const redirectUrl = clientId ? \`/main?clientId=\${clientId}\` : '/main';
               console.log('리다이렉트 URL:', redirectUrl);
               
               updateStatus('로그인 성공! 메인 페이지로 이동합니다...');
               
               setTimeout(() => {
                 console.log('페이지 이동 시작:', redirectUrl);
                 window.location.href = redirectUrl;
               }, 1500);
               
             } else {
               throw new Error('서버에서 토큰을 반환하지 않았습니다.');
             }
             
           } catch (error) {
             console.error('애플 로그인 처리 오류:', error);
             const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
             updateStatus('로그인 오류: ' + errorMessage, true);
             
             setTimeout(() => {
               console.log('오류로 인한 로그인 페이지 이동');
               window.location.href = '/login';
             }, 3000);
           }
         }
         
         // 페이지 로드 후 자동 실행
         document.addEventListener('DOMContentLoaded', function() {
           console.log('DOM 로드 완료, Apple 로그인 처리 시작');
           processAppleLogin();
         });
         
         // DOMContentLoaded가 이미 발생한 경우를 위한 fallback
         if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', processAppleLogin);
         } else {
           console.log('이미 DOM 로드됨, 즉시 Apple 로그인 처리 시작');
           processAppleLogin();
         }
       </script>
     </body>
     </html>
   `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("애플 form_post 콜백 최상위 오류:", error);

    return new Response(
      `
     <!DOCTYPE html>
     <html>
     <head>
       <title>로그인 오류</title>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
     </head>
     <body>
       <div style="text-align: center; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
         <h2>❌ 로그인 처리 중 오류가 발생했습니다</h2>
         <p style="color: #dc3545;">서버에서 예상치 못한 오류가 발생했습니다.</p>
         <p style="color: #6c757d; font-size: 14px;">3초 후 로그인 페이지로 이동합니다...</p>
       </div>
       <script>
         console.error('Apple 콜백 최상위 오류:', ${JSON.stringify(
           error instanceof Error ? error.message : String(error)
         )});
         setTimeout(() => {
           window.location.href = '/login';
         }, 3000);
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
  try {
    console.log("=== 애플 GET 콜백 처리 시작 ===");

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log("받은 GET 파라미터:", {
      code: code?.substring(0, 20) + "..." || null,
      error,
      errorDescription,
    });

    if (error) {
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
         <div style="text-align: center; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
           <h2>❌ 애플 로그인이 취소되었습니다</h2>
           <p style="color: #dc3545;">${errorDescription || error}</p>
           <p style="color: #6c757d; font-size: 14px;">3초 후 로그인 페이지로 이동합니다...</p>
         </div>
         <script>
           console.log('Apple GET 로그인 에러:', '${error}', '${errorDescription || ""}');
           setTimeout(() => {
             window.location.href = '/login';
           }, 3000);
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
           <p>GET 파라미터 처리 중...</p>
         </div>
         
         <script>
           console.log('=== Apple GET 콜백 HTML 로드 ===');
           
           // GET 파라미터 처리
           const urlParams = new URLSearchParams(window.location.search);
           const authData = {
             code: urlParams.get('code'),
             state: urlParams.get('state'),
             user: urlParams.get('user'),
             id_token: urlParams.get('id_token')
           };
           
           console.log('Apple GET 콜백 데이터:', authData);
           
           // API 호출
           fetch('/api/authorization/apple/web', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ code: authData.code })
           })
           .then(response => {
             console.log('API 응답 상태:', response.status);
             return response.json();
           })
           .then(data => {
             console.log('API 응답 데이터:', data);
             
             if (data.accessToken) {
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
               
               // clientId 확인 후 이동
               const clientId = localStorage.getItem('pendingClientId');
               localStorage.removeItem('pendingClientId');
               
               const redirectUrl = clientId ? \`/main?clientId=\${clientId}\` : '/main';
               
               alert('애플 로그인 성공!');
               window.location.href = redirectUrl;
             } else {
               throw new Error(data.message || '로그인 처리 실패');
             }
           })
           .catch(error => {
             console.error('Apple GET 로그인 오류:', error);
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
    console.log("파라미터가 없어서 로그인 페이지로 리다이렉트");
    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error("애플 GET 콜백 오류:", error);

    return new Response(
      `
     <!DOCTYPE html>
     <html>
     <head>
       <title>로그인 오류</title>
       <meta charset="utf-8">
     </head>
     <body>
       <div style="text-align: center; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
         <h2>❌ 로그인 처리 중 오류가 발생했습니다</h2>
         <p style="color: #6c757d;">3초 후 로그인 페이지로 이동합니다...</p>
       </div>
       <script>
         setTimeout(() => {
           window.location.href = '/login';
         }, 3000);
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
