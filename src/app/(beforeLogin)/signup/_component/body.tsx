"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./body.module.css";
import LoginIcons from "../../_component/loginicon";
import Link from "next/link";

export default function Body() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // ✅ URL에서 clientId 추출
  const clientId = searchParams.get("clientId");

  // 디버깅을 위한 로그
  useEffect(() => {
    if (clientId) {
      console.log("회원가입 페이지에서 받은 clientId:", clientId);
    }
  }, [clientId]);

  // 비밀번호 유효성 검사
  const validatePassword = (password: string, email: string) => {
    // 1️⃣ 영어, 숫자, 특수문자 포함 & 8자 이상
    const complexityRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!complexityRegex.test(password)) {
      return "비밀번호는 8자 이상, 영어/숫자/특수문자를 모두 포함해야 합니다.";
    }

    // 2️⃣ 동일 문자 3회 연속 불가
    if (/(.)\1\1/.test(password)) {
      return "같은 문자를 3회 이상 연속으로 사용할 수 없습니다.";
    }

    // 2️⃣-2 연속 증가/감소 문자 3자리 이상 불가 (abc, 123, cba 등)
    const isSequential = (str: string) => {
      const seq = str.toLowerCase();
      for (let i = 0; i < seq.length - 2; i++) {
        const a = seq.charCodeAt(i);
        const b = seq.charCodeAt(i + 1);
        const c = seq.charCodeAt(i + 2);
        if (b - a === 1 && c - b === 1) return true; // 오름차순
        if (a - b === 1 && b - c === 1) return true; // 내림차순
      }
      return false;
    };
    if (isSequential(password)) {
      return "연속된 문자를 3자 이상 사용할 수 없습니다.";
    }

    // 3️⃣ 이메일 형식 불가 (혹시 비밀번호가 이메일과 유사한 경우 방지)
    if (email && password.includes("@")) {
      return "비밀번호에 '@'는 사용할 수 없습니다.";
    }
    if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase())) {
      return "비밀번호에 이메일과 유사한 문자열은 사용할 수 없습니다.";
    }

    return ""; // 유효
  };

  // 이메일 인증번호 발송 API 호출
  const sendVerificationCode = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      console.log("API 호출 시작:", "/api/email/send-code");
      console.log("전송 데이터:", { email: email });

      const response = await fetch("/api/email/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // CORS 모드 명시적 설정
        body: JSON.stringify({
          email: email,
        }),
      });

      console.log("응답 상태:", response.status);
      console.log("응답 헤더:", response.headers);

      if (response.ok) {
        setShowCodeInput(true);
        setMessage("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      } else {
        let errorMessage = "인증번호 발송에 실패했습니다.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("응답 파싱 에러:", parseError);
          errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
        }
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error("API 호출 에러:", error);

      // 에러 타입에 따른 구체적인 메시지
      let errorMessage = "네트워크 오류가 발생했습니다. 다시 시도해주세요.";

      if (error instanceof Error) {
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        } else if (error.name === "AbortError") {
          errorMessage = "요청이 취소되었습니다.";
        } else {
          errorMessage = `네트워크 오류: ${error.message}`;
        }
      }

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인 API 호출
  const verifyCode = async () => {
    if (!verificationCode) {
      setMessage("인증번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/email/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: verificationCode,
        }),
      });

      if (response.ok) {
        setIsEmailVerified(true);
        setMessage("이메일 인증이 완료되었습니다.");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("API 호출 에러:", error);

      let errorMessage = "네트워크 오류가 발생했습니다. 다시 시도해주세요.";

      if (error instanceof Error) {
        errorMessage = `네트워크 오류: ${error.message}`;
      }

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 API 호출
  const handleSignUp = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }
    if (!isEmailVerified) {
      setMessage("이메일 인증을 완료해주세요.");
      return;
    }
    // 비밀번호 검증
    const passwordError = validatePassword(password, email);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/authorization/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("회원가입이 완료되었습니다!");
        // ✅ 성공시 로그인 페이지로 이동 (clientId 유지)
        console.log("회원가입 성공:", data);

        setTimeout(() => {
          const loginUrl = clientId ? `/login?clientId=${clientId}` : "/login";
          router.push(loginUrl);
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 에러:", error);

      let errorMessage = "네트워크 오류가 발생했습니다. 다시 시도해주세요.";

      if (error instanceof Error) {
        errorMessage = `네트워크 오류: ${error.message}`;
      }

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 돌아가기 링크에도 clientId 유지
  const getBackLink = () => {
    return clientId ? `/login?clientId=${clientId}` : "/login";
  };

  return (
    <div className={styles.body}>
      <p className={styles.title}>회원가입</p>

      <div className={styles.email}>
        <input
          placeholder="이메일"
          className={styles.email_input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <div
          className={styles.email_check}
          onClick={sendVerificationCode}
          style={{
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "발송중..." : "이메일 인증"}
        </div>
      </div>

      {showCodeInput && (
        <div className={styles.email}>
          <input
            placeholder="이메일 인증 번호"
            className={styles.email_input}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            disabled={isLoading}
          />
          <div
            className={styles.email_check}
            onClick={verifyCode}
            style={{
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "확인중..." : "인증 확인"}
          </div>
        </div>
      )}

      {message && (
        <p
          className={styles.message}
          style={{
            color: message.includes("완료") || message.includes("발송") ? "green" : "red",
            fontSize: "12px",
          }}
        >
          {message}
        </p>
      )}

      <input
        placeholder="비밀번호"
        className={styles.pw_input}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <p className={styles.message}>8~16자의 영문 대소문자, 숫자, 특수문자만 가능합니다.</p>
      <input
        placeholder="비밀번호 확인"
        className={styles.check_input}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
      />

      <div
        className={styles.signup_button}
        onClick={handleSignUp}
        style={{
          opacity: isLoading || !isEmailVerified ? 0.5 : 1,
          cursor: isLoading || !isEmailVerified ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "처리중..." : "가입하기"}
      </div>

      {/* ✅ 돌아가기 링크에 clientId 유지 */}
      <Link href={getBackLink()} className={styles.back_button}>
        돌아가기
      </Link>

      {/* ✅ LoginIcons 컴포넌트에 clientId 전달 */}
      <LoginIcons clientId={clientId} />
    </div>
  );
}
