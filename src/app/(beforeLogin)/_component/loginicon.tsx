"use client";

import { RiKakaoTalkFill } from "react-icons/ri";
import { AiFillApple } from "react-icons/ai";
import { FaGoogle } from "react-icons/fa";
import { SiNaver } from "react-icons/si";

import styles from "./loginicon.module.css";
import type { LoginIconsProps } from "@/types/auth";

export default function LoginIcons({ clientId }: LoginIconsProps) {
  // 소셜 로그인 전에 필요한 정보들을 localStorage에 저장하는 함수
  const buildRedirectUrl = (provider: string) => {
    console.log(`=== ${provider.toUpperCase()} 소셜 로그인 시작 ===`);
    console.log("현재 clientId:", clientId);

    // 기존 clientId 저장 (기존 로직 유지)
    if (clientId) {
      localStorage.setItem("pendingClientId", clientId);
      console.log(`${provider} 로그인 전 clientId 저장:`, clientId);
    }

    // URL 파라미터에서 상품 정보 추출
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");
    const itemId = urlParams.get("itemId");
    const images = urlParams.get("images");

    console.log("URL 파라미터 확인:", { redirectPath, itemId, images });

    // 상품 정보 저장 (URL 파라미터 기반)
    if (redirectPath === "/product" && clientId && itemId) {
      const productInfo = {
        clientId,
        itemId,
        images,
        redirectPath,
      };
      localStorage.setItem("pendingProductInfo", JSON.stringify(productInfo));
      console.log(`${provider} 소셜 로그인용 상품 정보 저장:`, productInfo);
    } else {
      // 상품 정보가 이미 저장되어 있는지 확인
      const existingProductInfo = localStorage.getItem("pendingProductInfo");
      if (existingProductInfo) {
        console.log(`${provider} 로그인 전 기존 상품 정보 확인:`, existingProductInfo);
      }
    }

    const redirectUrl = `/api/authorization/${provider}/redirection`;
    console.log("생성된 소셜 로그인 URL:", redirectUrl);
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
