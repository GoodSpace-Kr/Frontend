"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "../../../utils/apiClient";
import { TokenManager } from "../../../utils/tokenManager";

import styles from "./servicecenter.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Body from "./_component/body";

export default function ServiceCenter() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = 확인 중
  const [isLoading, setIsLoading] = useState(true);

  // 토큰 유효성 검사 함수
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  // 쿠키에서 값 가져오는 함수
  const getCookieValue = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // 로그인 상태 확인 함수
  const checkLoginStatus = async (): Promise<boolean> => {
    try {
      console.log("🔍 ServiceCenter 로그인 상태 확인 시작");

      // localStorage에서 토큰 확인
      const localAccessToken = localStorage.getItem("accessToken");
      const localRefreshToken = localStorage.getItem("refreshToken");

      // 쿠키에서 토큰 확인
      const cookieAccessToken = getCookieValue("accessToken");
      const cookieRefreshToken = getCookieValue("refreshToken");

      // 우선순위: localStorage -> 쿠키
      const accessToken = localAccessToken || cookieAccessToken;
      const refreshToken = localRefreshToken || cookieRefreshToken;

      console.log("🔍 토큰 상태:", {
        localAccessToken: !!localAccessToken,
        localRefreshToken: !!localRefreshToken,
        cookieAccessToken: !!cookieAccessToken,
        cookieRefreshToken: !!cookieRefreshToken,
        finalAccessToken: !!accessToken,
        finalRefreshToken: !!refreshToken,
      });

      // 토큰이 없으면 로그인 안됨
      if (!accessToken || !refreshToken) {
        console.log("❌ 토큰이 없음");
        return false;
      }

      // 리프레시 토큰 유효성 확인
      const isRefreshValid = isTokenValid(refreshToken);
      if (!isRefreshValid) {
        console.log("❌ 리프레시 토큰 만료");
        // 만료된 토큰 정리
        TokenManager.clearTokens();
        return false;
      }

      // 액세스 토큰 유효성 확인
      const isAccessValid = isTokenValid(accessToken);
      if (!isAccessValid) {
        console.log("🔄 액세스 토큰 만료, 재발급 시도");
        try {
          // 토큰 재발급 시도
          const newAccessToken = await TokenManager.refreshAccessToken();
          if (newAccessToken) {
            console.log("✅ 토큰 재발급 성공");
            return true;
          } else {
            console.log("❌ 토큰 재발급 실패");
            return false;
          }
        } catch (error) {
          console.error("❌ 토큰 재발급 중 오류:", error);
          return false;
        }
      }

      console.log("✅ 로그인 상태 확인됨");
      return true;
    } catch (error) {
      console.error("❌ 로그인 상태 확인 중 오류:", error);
      return false;
    }
  };

  useEffect(() => {
    const validateLogin = async () => {
      setIsLoading(true);

      const loginStatus = await checkLoginStatus();
      setIsLoggedIn(loginStatus);

      if (!loginStatus) {
        console.log("❌ 로그인되지 않음, 로그인 페이지로 이동");
        alert("로그인이 필요한 서비스입니다.");
        router.push("/login");
      } else {
        console.log("✅ 로그인 확인 완료, 고객센터 페이지 표시");
      }

      setIsLoading(false);
    };

    validateLogin();
  }, [router]);

  // 로딩 중 화면
  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>로그인 상태 확인 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // 로그인이 안 되어 있으면 빈 화면 (리다이렉트 진행 중)
  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.redirectContainer}>
          <p className={styles.redirectText}>로그인 페이지로 이동 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // 로그인되어 있으면 고객센터 내용 표시
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Body />
        <Footer />
      </div>
    </>
  );
}
