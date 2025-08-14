"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./body.module.css";

export default function FindEmail() {
  const router = useRouter();

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password: string, userEmail: string) => {
    // 1. 길이 검사 (8자 이상)
    if (password.length < 8) {
      return { isValid: false, message: "비밀번호는 8자리 이상이어야 합니다." };
    }

    // 2. 영어 포함 검사
    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, message: "비밀번호에 영어가 포함되어야 합니다." };
    }

    // 3. 숫자 포함 검사
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "비밀번호에 숫자가 포함되어야 합니다." };
    }

    // 4. 특수문자 포함 검사
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: "비밀번호에 특수문자가 포함되어야 합니다." };
    }

    // 5. 연속 문자 검사 (3자 이상 연속)
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      // 연속된 문자 (abc, 123, ㄱㄴㄷ 등)
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return { isValid: false, message: "연속된 3자 이상의 문자는 사용할 수 없습니다." };
      }

      // 동일한 문자 3자 이상 (aaa, 111 등)
      if (char1 === char2 && char2 === char3) {
        return { isValid: false, message: "동일한 문자를 3자 이상 연속으로 사용할 수 없습니다." };
      }
    }

    // 6. 이메일 형식 불가 검사
    const emailLocal = userEmail.split("@")[0].toLowerCase();
    const passwordLower = password.toLowerCase();

    if (passwordLower.includes(emailLocal) && emailLocal.length >= 3) {
      return { isValid: false, message: "이메일 아이디가 포함된 비밀번호는 사용할 수 없습니다." };
    }

    // 이메일 전체가 포함된 경우
    if (passwordLower.includes(userEmail.toLowerCase())) {
      return { isValid: false, message: "이메일이 포함된 비밀번호는 사용할 수 없습니다." };
    }

    return { isValid: true, message: "유효한 비밀번호입니다." };
  };

  // 상태 관리
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 이메일 인증 코드 전송
  const handleSendVerificationCode = async () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/email/send-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          shouldAlreadyExist: true, // 가입된 이메일만 인증번호 발송
        }),
      });

      if (response.ok) {
        alert("인증 코드가 이메일로 전송되었습니다.");
        setShowCodeInput(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "인증 코드 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("인증 코드 전송 오류:", error);
      alert(error instanceof Error ? error.message : "인증 코드 전송 중 오류가 발생했습니다.");
      // 오류 발생 시 코드 입력 폼 숨기기
      setShowCodeInput(false);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인증 코드 확인
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      alert("인증 코드를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/email/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
        }),
      });

      if (response.ok) {
        alert("이메일 인증이 완료되었습니다.");
        setIsEmailVerified(true);
        setShowPasswordInput(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "인증 코드가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("인증 코드 확인 오류:", error);
      alert(error instanceof Error ? error.message : "인증 코드 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 새로운 API로 변경된 비밀번호 변경 함수
  const handleChangePassword = async () => {
    if (!isEmailVerified) {
      alert("먼저 이메일 인증을 완료해주세요.");
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert("새 비밀번호와 확인 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePassword(newPassword, email);
    if (!passwordValidation.isValid) {
      alert(passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      console.log("비밀번호 변경 API 호출 시작...");

      // ✅ 새로운 forget-password API 사용
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/forget-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: newPassword.trim(),
        }),
      });

      console.log("API 응답 상태:", response.status);

      if (response.ok) {
        // 성공 응답 처리
        const responseData = await response.json();
        console.log("성공 응답:", responseData);

        alert("비밀번호가 성공적으로 변경되었습니다.");
      } else {
        // 에러 응답 처리
        let errorMessage = "비밀번호 변경에 실패했습니다.";

        try {
          const errorData = await response.json();
          console.log("에러 응답:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("에러 응답 파싱 실패:", parseError);
          // 응답을 텍스트로 읽어보기
          const responseText = await response.text();
          console.log("에러 응답 텍스트:", responseText);
        }

        // 특정 에러 코드별 처리
        if (response.status === 400) {
          errorMessage = "잘못된 요청입니다. 이메일이나 비밀번호를 확인해주세요.";
        } else if (response.status === 404) {
          errorMessage = "해당 이메일로 가입된 계정을 찾을 수 없습니다.";
        } else if (response.status === 403) {
          errorMessage = "이메일 인증이 완료되지 않았습니다. 다시 인증해주세요.";
          // 인증 상태 초기화
          setIsEmailVerified(false);
          setShowPasswordInput(false);
          setShowCodeInput(false);
          setVerificationCode("");
        } else if (response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      alert(error instanceof Error ? error.message : "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.findemail}>
        <p className={styles.title}>비밀번호 찾기</p>

        {/* 이메일 입력 및 인증 코드 전송 */}
        <div className={styles.email}>
          <input
            placeholder="이메일"
            className={styles.input_email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEmailVerified || loading}
          />
          <p
            className={`${styles.email_button} ${isEmailVerified || loading ? styles.disabled : ""}`}
            onClick={!isEmailVerified && !loading ? handleSendVerificationCode : undefined}
            style={{
              opacity: isEmailVerified || loading ? 0.5 : 1,
              cursor: isEmailVerified || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "전송 중..." : isEmailVerified ? "인증 완료" : "이메일 인증"}
          </p>
        </div>

        {/* 인증 코드 입력 */}
        {showCodeInput && !isEmailVerified && (
          <div className={styles.email}>
            <input
              placeholder="이메일 인증 번호"
              className={styles.email_input}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={loading}
            />
            <div
              className={`${styles.email_check} ${loading ? styles.disabled : ""}`}
              onClick={!loading ? handleVerifyCode : undefined}
              style={{
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "확인 중..." : "인증 확인"}
            </div>
          </div>
        )}

        {/* 새 비밀번호 입력 */}
        {showPasswordInput && isEmailVerified && (
          <>
            <input
              placeholder="비밀번호 재설정 (영어, 숫자, 특수문자 포함 8자 이상)"
              className={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <input
              placeholder="비밀번호 확인"
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            {/* 비밀번호 조건 안내 */}
            <div className={styles.password_guide}>
              <p className={styles.a}>비밀번호 조건:</p>
              <p className={styles.a}>영어, 숫자, 특수문자 포함 8자 이상</p>
              <p className={styles.a}>연속된 문자 3자 이상 사용 불가 (abc, 123, aaa 등)</p>
              <p className={styles.a}>이메일 아이디 포함 불가</p>
            </div>

            <div
              className={`${styles.button} ${loading ? styles.disabled : ""}`}
              onClick={!loading ? handleChangePassword : undefined}
              style={{
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </div>
          </>
        )}

        {/* 로그인 페이지로 돌아가기 */}
        <Link href="/login" className={styles.button} style={{ marginTop: "10px" }}>
          로그인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
