"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/(beforeLogin)/login/login.module.css";
import Header from "@/app/(beforeLogin)/_component/header";
import Footer from "@/app/(beforeLogin)/_component/footer";
import Body from "./_component/body";

function LoginContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");

  // clientId가 존재하는 경우 디버깅 로그 추가
  if (clientId) {
    console.log("Login 페이지에서 clientId 확인:", clientId);
  }

  return (
    <>
      <div className={styles.container}>
        <Header />
        {/* Body 컴포넌트에 clientId를 props로 전달 */}
        <Body clientId={clientId} />
        <Footer />
      </div>
    </>
  );
}

// Fallback 컴포넌트 (로딩 중일 때 표시)
function LoginFallback() {
  return (
    <div className={styles.container}>
      <Header />
      {/* clientId 없이 기본 Body 컴포넌트 렌더링 */}
      <Body clientId={null} />
      <Footer />
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
