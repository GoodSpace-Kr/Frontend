"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/(homepage)/_component/footer.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import { MdFacebook } from "react-icons/md";
import { BsInstagram } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  // 쿠키 설정 함수
  const setCookie = (name: string, value: string, days: number = 7): void => {
    if (typeof document === "undefined") return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  // localStorage와 쿠키 동기화 함수
  const syncTokens = (): void => {
    if (typeof window === "undefined") return;

    const localAccessToken = localStorage.getItem("accessToken");
    const localRefreshToken = localStorage.getItem("refreshToken");
    const cookieAccessToken = getCookieValue("accessToken");
    const cookieRefreshToken = getCookieValue("refreshToken");

    // localStorage에는 있지만 쿠키에는 없는 경우 쿠키에 저장
    if (localAccessToken && !cookieAccessToken) {
      setCookie("accessToken", localAccessToken);
    }
    if (localRefreshToken && !cookieRefreshToken) {
      setCookie("refreshToken", localRefreshToken);
    }

    // 쿠키에는 있지만 localStorage에는 없는 경우 localStorage에 저장
    if (cookieAccessToken && !localAccessToken) {
      localStorage.setItem("accessToken", cookieAccessToken);
    }
    if (cookieRefreshToken && !localRefreshToken) {
      localStorage.setItem("refreshToken", cookieRefreshToken);
    }
  };

  // 로그인 상태 확인
  const checkLoginStatus = (): boolean => {
    if (typeof window === "undefined") return false;

    // 토큰 동기화
    syncTokens();

    // localStorage에서 토큰 확인
    const localAccessToken = localStorage.getItem("accessToken");
    const localRefreshToken = localStorage.getItem("refreshToken");

    // 쿠키에서 토큰 확인
    const cookieAccessToken = getCookieValue("accessToken");
    const cookieRefreshToken = getCookieValue("refreshToken");

    // 우선순위: localStorage -> 쿠키
    const accessToken = localAccessToken || cookieAccessToken;
    const refreshToken = localRefreshToken || cookieRefreshToken;

    console.log("토큰 상태 확인:", {
      localAccessToken: !!localAccessToken,
      localRefreshToken: !!localRefreshToken,
      cookieAccessToken: !!cookieAccessToken,
      cookieRefreshToken: !!cookieRefreshToken,
      finalAccessToken: !!accessToken,
      finalRefreshToken: !!refreshToken,
    });

    // 토큰이 존재하고 유효한지 확인
    if (accessToken && refreshToken) {
      const isAccessValid = isTokenValid(accessToken);
      const isRefreshValid = isTokenValid(refreshToken);

      console.log("토큰 유효성:", {
        isAccessValid,
        isRefreshValid,
      });

      // 리프레시 토큰이 유효하면 로그인 상태로 판단
      return isRefreshValid;
    }

    return false;
  };

  useEffect(() => {
    // 초기 로그인 상태 확인
    const loginStatus = checkLoginStatus();
    setIsLoggedIn(loginStatus);

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시 동기화)
    const handleStorageChange = () => {
      const newLoginStatus = checkLoginStatus();
      setIsLoggedIn(newLoginStatus);
    };

    // 페이지 포커스 시에도 로그인 상태 재확인
    const handleFocus = () => {
      const newLoginStatus = checkLoginStatus();
      setIsLoggedIn(newLoginStatus);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    // 주기적으로 토큰 상태 확인 (30초마다)
    const intervalId = setInterval(() => {
      const newLoginStatus = checkLoginStatus();
      setIsLoggedIn(newLoginStatus);
    }, 30000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  // 고객센터 클릭 핸들러
  const handleServiceCenterClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // 최신 로그인 상태 확인
    const currentLoginStatus = checkLoginStatus();
    setIsLoggedIn(currentLoginStatus);

    if (currentLoginStatus) {
      console.log("로그인 상태 확인됨, 고객센터로 이동");
      router.push("/servicecenter");
    } else {
      console.log("로그인 필요, 로그인 페이지로 이동");
      router.push("/login");
    }
  };

  // 로그인 상태에 따른 링크 결정
  const getTermsLink = () => {
    return isLoggedIn ? "/aftertermsofuse" : "/beforetermsofuse";
  };

  const getPrivacyLink = () => {
    return isLoggedIn ? "/afterprivacypolicy" : "/beforeprivacypolicy";
  };

  return (
    <>
      <div className={styles.footer}>
        <div className={styles.logos}>
          <Image src={Logo} alt="logo" className={styles.logo} />
          <div className={styles.sns}>
            <MdFacebook className={styles.icon} />
            <BsInstagram className={styles.icon} />
            <FaYoutube className={styles.icon} />
            <FaXTwitter className={styles.icon} />
          </div>
        </div>
        <div className={styles.menus}>
          <div className={styles.menu_item}>
            <p className={styles.menu_item_title}>About</p>
            <p className={styles.menu_item_list}>서비스 소개</p>
            <p className={styles.menu_item_list}>공지 사항</p>
            <p className={styles.menu_item_list}>수정 노트</p>
          </div>
          <div className={styles.menu_item}>
            <p className={styles.menu_item_title}>Help</p>
            <a href="#" onClick={handleServiceCenterClick} className={styles.menu_item_list}>
              고객센터
            </a>
            <Link href={getTermsLink()} className={styles.menu_item_list}>
              이용약관
            </Link>
            <Link href={getPrivacyLink()} className={styles.menu_item_list}>
              개인정보처리방침
            </Link>
          </div>
          <div className={styles.menu_item}>
            <p className={styles.menu_item_title}>Contact us</p>
            <p className={styles.menu_item_list_a}>1234-5678</p>
            <p className={styles.menu_item_list_a}>평일 09:30 ~ 16:30 (주말/공휴일 휴무)</p>
            <p className={styles.menu_item_list_a}>good@space.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
