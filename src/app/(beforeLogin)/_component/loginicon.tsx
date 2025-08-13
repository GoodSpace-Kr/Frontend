"use client";

import { RiKakaoTalkFill } from "react-icons/ri";
import { AiFillApple } from "react-icons/ai";
import { FaGoogle } from "react-icons/fa";
import { SiNaver } from "react-icons/si";

import styles from "./loginicon.module.css";
import type { LoginIconsProps } from "@/types/auth";

export default function LoginIcons({ clientId }: LoginIconsProps) {
  // clientId를 localStorage에 임시 저장하고 리다이렉트 URL 생성하는 함수
  const buildRedirectUrl = (provider: string) => {
    console.log(`=== ${provider.toUpperCase()} 로그인 시작 ===`);
    console.log("현재 clientId:", clientId);

    if (clientId) {
      localStorage.setItem("pendingClientId", clientId);
      console.log(`${provider} 로그인 전 clientId 저장:`, clientId);
      console.log("localStorage 저장 확인:", localStorage.getItem("pendingClientId"));
    } else {
      console.log("clientId가 없어서 저장하지 않음");
    }

    const redirectUrl = `/authorization/${provider}/redirection`;
    console.log("생성된 리다이렉트 URL:", redirectUrl);
    return redirectUrl;
  };

  const handleKakaoLogin = () => {
    try {
      const url = buildRedirectUrl("kakao");
      console.log("🟡 카카오 로그인 리다이렉트:", url);
      window.location.href = url;
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
      alert("카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleNaverLogin = () => {
    try {
      const url = buildRedirectUrl("naver");
      console.log("🟢 네이버 로그인 리다이렉트:", url);
      window.location.href = url;
    } catch (error) {
      console.error("네이버 로그인 오류:", error);
      alert("네이버 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleGoogleLogin = () => {
    try {
      const url = buildRedirectUrl("google");
      console.log("🔴 구글 로그인 리다이렉트:", url);
      window.location.href = url;
    } catch (error) {
      console.error("구글 로그인 오류:", error);
      alert("구글 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleAppleLogin = () => {
    try {
      const url = buildRedirectUrl("apple");
      console.log("⚫ 애플 로그인 리다이렉트:", url);
      window.location.href = url;
    } catch (error) {
      console.error("애플 로그인 오류:", error);
      alert("애플 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.login_icons}>
      <div className={styles.kakao} onClick={handleKakaoLogin}>
        <RiKakaoTalkFill />
      </div>
      <div className={styles.apple} onClick={handleAppleLogin}>
        <AiFillApple className={styles.icon} />
      </div>
      <div className={styles.google} onClick={handleGoogleLogin}>
        <FaGoogle className={styles.icon} />
      </div>
      <div className={styles.naver} onClick={handleNaverLogin}>
        <SiNaver className={styles.icon} />
      </div>
    </div>
  );
}
