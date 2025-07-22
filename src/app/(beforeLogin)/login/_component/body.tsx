"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./body.module.css";
import LoginIcons from "../../_component/loginicon";
import Link from "next/link";

export default function Body() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/authorization/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      console.log("응답:", text);

      if (!res.ok) {
        setMessage("로그인에 실패했습니다.");
        return;
      }

      const data = JSON.parse(text);

      // accessToken, refreshToken 저장
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setMessage("로그인 성공!");
      router.push("/main");
    } catch (err) {
      console.error(err);
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <div className={styles.body}>
      <p className={styles.title}>로그인</p>
      <input
        placeholder="이메일"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <input
        placeholder="비밀번호"
        className={styles.input}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />

      {message && (
        <p
          style={{
            color: message.includes("성공") ? "green" : "red",

            fontSize: "12px",
          }}
        >
          {message}
        </p>
      )}

      <div className={styles.find}>
        <Link href="/findemail" className={styles.find_button}>
          이메일(아이디) 찾기
        </Link>
        <Link href="/findpw" className={styles.find_button}>
          비밀번호 찾기
        </Link>
      </div>

      <div
        className={styles.login_button}
        onClick={handleLogin}
        style={{
          opacity: isLoading ? 0.5 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </div>

      <div className={styles.signup_button} onClick={handleSignup}>
        회원가입
      </div>

      <LoginIcons />
    </div>
  );
}
