"use client";

import { useState, useEffect } from "react";
import styles from "@/app/(homepage)/_component/footer.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import { MdFacebook } from "react-icons/md";
import { BsInstagram } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      // localStorage에서 토큰 확인
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // 쿠키에서도 토큰 확인 (쿠키 파싱)
      const getCookieValue = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
      };

      const cookieAccessToken = getCookieValue("accessToken");
      const cookieRefreshToken = getCookieValue("refreshToken");

      // localStorage 또는 쿠키 중 하나라도 토큰이 있으면 로그인 상태로 판단
      const hasToken = (accessToken && refreshToken) || (cookieAccessToken && cookieRefreshToken);

      setIsLoggedIn(!!hasToken);
    };

    // 초기 로그인 상태 확인
    checkLoginStatus();

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시 동기화)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    // 페이지 포커스 시에도 로그인 상태 재확인 (쿠키 변경 감지)
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

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
            <Link href="/servicecenter" className={styles.menu_item_list}>
              고객센터
            </Link>
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
