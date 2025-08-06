"use client";

import { useSearchParams } from "next/navigation";
import styles from "@/app/(beforeLogin)/login/login.module.css";
import Header from "@/app/(beforeLogin)/_component/header";
import Footer from "@/app/(beforeLogin)/_component/footer";
import Body from "./_component/body";

export default function Login() {
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
