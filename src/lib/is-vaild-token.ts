// lib/is-valid-token.ts
function isValidToken({ accesstoken, refreshtoken }: { accesstoken?: string; refreshtoken?: string }): {
  isAccessTokenValid?: boolean;
  isRefreshTokenValid?: boolean;
} {
  // 현재 시간을 초 단위로 가져오기 (Unix Timestamp 형식)
  const currentTime = Math.floor(Date.now() / 1000);

  // 결과 객체를 초기화 (유효성 여부를 저장)
  const result: {
    isAccessTokenValid?: boolean;
    isRefreshTokenValid?: boolean;
  } = {};

  try {
    // 액세스 토큰이 존재하면 디코딩하여 만료 시간(`exp`) 확인
    if (accesstoken) {
      // JWT의 payload 부분(base64) 디코딩
      const accessTokenPayload = JSON.parse(atob(accesstoken.split(".")[1]));
      // 현재 시간과 만료 시간을 비교하여 유효성 판단
      result.isAccessTokenValid = accessTokenPayload.exp > currentTime;
      console.log("🔍 Access Token 만료 시간:", new Date(accessTokenPayload.exp * 1000));
      console.log("🔍 현재 시간:", new Date(currentTime * 1000));
      console.log("🔍 Access Token 유효:", result.isAccessTokenValid);
    }

    // 리프레쉬 토큰이 존재하면 디코딩하여 만료 시간(`exp`) 확인
    if (refreshtoken) {
      // JWT의 payload 부분(base64) 디코딩
      const refreshTokenPayload = JSON.parse(atob(refreshtoken.split(".")[1]));
      // 현재 시간과 만료 시간을 비교하여 유효성 판단
      result.isRefreshTokenValid = refreshTokenPayload.exp > currentTime;
      console.log("🔍 Refresh Token 만료 시간:", new Date(refreshTokenPayload.exp * 1000));
      console.log("🔍 Refresh Token 유효:", result.isRefreshTokenValid);
    }
  } catch (error) {
    // 디코딩 과정에서 발생한 오류를 로그로 출력
    console.error("❌ 토큰 디코딩 실패:", error);
  }

  // 유효성 결과를 반환
  return result;
}

export default isValidToken;
