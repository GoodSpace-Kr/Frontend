"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./body.module.css";
import LoginIcons from "../../_component/loginicon";
import Link from "next/link";

// props에 clientId 추가
interface BodyProps {
  clientId?: string | null;
}

export default function Body({ clientId }: BodyProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 디버깅을 위한 로그
  useEffect(() => {
    if (clientId) {
      console.log("Body 컴포넌트에서 받은 clientId:", clientId);
    }
  }, [clientId]);

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

      // localStorage에 저장 (기존)
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 쿠키에도 저장 (미들웨어에서 사용하기 위해) - 이 부분이 중요
      document.cookie = `accessToken=${data.accessToken}; path=/`; // 토큰 자체 만료시간 사용
      document.cookie = `refreshToken=${data.refreshToken}; path=/`; // 토큰 자체 만료시간 사용

      console.log("✅ 토큰 저장 완료:");
      console.log("- localStorage accessToken:", localStorage.getItem("accessToken"));
      console.log("- localStorage refreshToken:", localStorage.getItem("refreshToken"));
      console.log("- 쿠키 설정 완료");

      setMessage("로그인 성공!");

      // 잠시 후 페이지 이동 (쿠키 설정이 완료되도록)
      setTimeout(() => {
        // clientId가 있으면 해당 clientId를 가지고 main 페이지로 이동
        if (clientId) {
          console.log(`로그인 성공 후 이동: /main?clientId=${clientId}`);
          router.push(`/main?clientId=${clientId}`);
        } else {
          router.push("/main");
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    // 회원가입 페이지로 이동할 때도 clientId 유지
    if (clientId) {
      router.push(`/signup?clientId=${clientId}`);
    } else {
      router.push("/signup");
    }
  };

  // 비밀번호 찾기와 이메일 찾기 페이지 링크에도 clientId 전달
  const getFindEmailLink = () => {
    return clientId ? `/findemail?clientId=${clientId}` : "/findemail";
  };

  const getFindPwLink = () => {
    return clientId ? `/findpw?clientId=${clientId}` : "/findpw";
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
        <Link href={getFindEmailLink()} className={styles.find_button}>
          이메일(아이디) 찾기
        </Link>
        <Link href={getFindPwLink()} className={styles.find_button}>
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
