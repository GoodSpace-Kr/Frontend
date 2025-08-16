"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/(beforeLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.png";
import Image from "next/image";
import Link from "next/link";

function HeaderContent() {
  const searchParams = useSearchParams();

  // 현재 페이지의 모든 정보를 포함한 로그인/회원가입 URL 생성
  const createAuthUrl = (type: "login" | "signup") => {
    const currentParams = new URLSearchParams();

    // 현재 페이지의 모든 파라미터를 가져와서 추가
    searchParams.forEach((value, key) => {
      currentParams.append(key, value);
    });

    // redirect URL을 현재 페이지로 설정
    const currentPath = window.location.pathname;
    if (currentPath === "/product") {
      currentParams.append("redirect", "/product");
    }

    return `/${type}?${currentParams.toString()}`;
  };

  // 기본 URL (파라미터가 없는 경우)
  const clientId = searchParams.get("clientId");
  const defaultLoginUrl = clientId ? `/login?clientId=${clientId}` : "/login";
  const defaultSignupUrl = clientId ? `/signup?clientId=${clientId}` : "/signup";

  // 현재 경로가 /product인지 확인
  const isProductPage = typeof window !== "undefined" && window.location.pathname === "/product";

  const loginUrl = isProductPage ? createAuthUrl("login") : defaultLoginUrl;
  const signupUrl = isProductPage ? createAuthUrl("signup") : defaultSignupUrl;

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logobox}>
          <Image src={Logo} alt="logo" className={styles.logo} />
        </Link>
        <div className={styles.nav}>
          <Link href={signupUrl} className={styles.button}>
            회원가입
          </Link>
          <Link href={loginUrl} className={styles.loginButton}>
            로그인
          </Link>
        </div>
      </div>
    </>
  );
}

// Fallback 헤더 (로딩 중일 때 표시)
function HeaderFallback() {
  return (
    <div className={styles.header}>
      <Link href="/" className={styles.logobox}>
        <Image src={Logo} alt="logo" className={styles.logo} />
      </Link>
      <div className={styles.nav}>
        <Link href="/signup" className={styles.button}>
          회원가입
        </Link>
        <Link href="/login" className={styles.loginButton}>
          로그인
        </Link>
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent />
    </Suspense>
  );
}
