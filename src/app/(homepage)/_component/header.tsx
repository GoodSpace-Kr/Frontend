"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import styles from "@/app/(beforeLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import Link from "next/link";
// 기존 로그인 후 헤더 컴포넌트 import
import AfterLoginHeader from "@/app/(afterLogin)/_component/header";

// Context에서 사용하는 ClientData 타입과 동일하게 정의
interface ClientData {
  id: string;
  name: string;
  profileImageUrl: string;
  backgroundImageUrl?: string;
  introduction?: string;
  clientType?: string;
}

interface HeaderProps {
  clientData?: ClientData | null;
}

// 로그인 전 헤더 컴포넌트
function BeforeLoginHeaderContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");

  const loginUrl = clientId ? `/login?clientId=${clientId}` : "/login";
  const signupUrl = clientId ? `/signup?clientId=${clientId}` : "/signup";

  return (
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

// 메인 헤더 컴포넌트
export default function Header({ clientData }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname(); // Hook을 최상단으로 이동

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      // localStorage에서 토큰 확인
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // 또는 쿠키에서 토큰 확인
      const cookieAccessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const isAuthenticated = !!(accessToken || cookieAccessToken);
      setIsLoggedIn(isAuthenticated);
    };

    checkLoginStatus();

    // 스토리지 변화 감지 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 로딩 중
  if (isLoggedIn === null) {
    return (
      <Suspense fallback={<HeaderFallback />}>
        <HeaderFallback />
      </Suspense>
    );
  }

  // 로그인 상태에 따라 다른 헤더 렌더링
  if (isLoggedIn) {
    const isHomePage = pathname === "/";

    // 최상위 페이지에서는 프로필 없는 버전으로 표시
    if (isHomePage) {
      return (
        <div className={styles.header}>
          <Link href="/" className={styles.logobox}>
            <Image src={Logo} alt="logo" className={styles.logo} />
          </Link>
          <div className={styles.nav}>
            <Link href="/shoppingcart" className={styles.button}>
              장바구니
            </Link>
            <Link href="/mypage" className={styles.button}>
              마이페이지
            </Link>
          </div>
        </div>
      );
    }

    // 다른 페이지에서는 기존 로그인 후 헤더 컴포넌트 사용
    return <AfterLoginHeader clientData={clientData} />;
  } else {
    return (
      <Suspense fallback={<HeaderFallback />}>
        <BeforeLoginHeaderContent />
      </Suspense>
    );
  }
}
