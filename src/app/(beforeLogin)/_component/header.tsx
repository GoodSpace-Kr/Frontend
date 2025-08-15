"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/(beforeLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.png";
import Image from "next/image";
import Link from "next/link";

function HeaderContent() {
  // URL에서 clientId 가져오기
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");

  // clientId가 있으면 URL에 추가, 없으면 기본 URL 사용
  const loginUrl = clientId ? `/login?clientId=${clientId}` : "/login";
  const signupUrl = clientId ? `/signup?clientId=${clientId}` : "/signup";

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
