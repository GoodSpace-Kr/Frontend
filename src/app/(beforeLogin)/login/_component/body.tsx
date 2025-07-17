"use client";

import { useRouter } from "next/navigation";
import styles from "./body.module.css";
import LoginIcons from "../../_component/loginicon";

export default function Body() {
  const router = useRouter();

  const handleLogin = () => {
    // 임시 로그인 상태 저장
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "테스트 유저",
        email: "test@test.com",
      })
    );

    // afterLogin의 main으로 이동
    router.push("/main");
  };

  const handleSignup = () => {
    // 회원가입 페이지로 이동 (나중에 구현)
    router.push("/signup");
  };

  return (
    <>
      <div className={styles.body}>
        <p className={styles.title}>로그인</p>
        <input placeholder="이메일" className={styles.input}></input>
        <input placeholder="비밀번호" className={styles.input}></input>
        <div className={styles.find}>
          <p className={styles.find_button}>이메일(아이디) 찾기</p>
          <p className={styles.find_button}>비밀번호 찾기</p>
        </div>
        <div className={styles.login_button} onClick={handleLogin}>
          로그인
        </div>
        <div className={styles.signup_button} onClick={handleSignup}>
          회원가입
        </div>
        <LoginIcons />
      </div>
    </>
  );
}
