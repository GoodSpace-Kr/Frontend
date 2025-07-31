"use client";

import { useEffect, useState } from "react";
import styles from "./password.module.css";
import { TokenManager } from "@/utils/tokenManager";

interface ModalProps {
  title?: string;
  setModal: () => void;
  userEmail?: string; // 사용자 이메일을 받아서 비밀번호 검증에 사용
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

const Modal = ({ title, setModal, userEmail = "" }: ModalProps) => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    isValid: false,
    errors: [],
  });

  // 모달 내부를 눌렀을 때 모달이 꺼지는 것을 방지
  const preventOffModal = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  // 모달이 뜬 상태에서는 뒷 화면 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 새 비밀번호 유효성 검사
  const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];

    // 1. 8자 이상 체크
    if (password.length < 8) {
      errors.push("8자 이상 입력해주세요.");
    }

    // 2. 영어+숫자+특수문자 포함 체크
    const hasEnglish = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasEnglish) {
      errors.push("영문자를 포함해주세요.");
    }
    if (!hasNumber) {
      errors.push("숫자를 포함해주세요.");
    }
    if (!hasSpecialChar) {
      errors.push("특수문자를 포함해주세요.");
    }

    // 3. 동일 문자 연속 방지 (3자 이상 연속)
    const hasSameChars = /(.)\1{2,}/.test(password);
    if (hasSameChars) {
      errors.push("동일한 문자를 3번 이상 연속으로 사용할 수 없습니다.");
    }

    // 4. 연속 문자 방지 (123, abc 등)
    let hasSequentialChars = false;
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      if ((char2 === char1 + 1 && char3 === char2 + 1) || (char2 === char1 - 1 && char3 === char2 - 1)) {
        hasSequentialChars = true;
        break;
      }
    }
    if (hasSequentialChars) {
      errors.push("연속된 문자(123, abc 등)를 3자 이상 사용할 수 없습니다.");
    }

    // 5. 이메일 기반 비밀번호 방지
    if (userEmail && password.toLowerCase().includes(userEmail.split("@")[0].toLowerCase())) {
      errors.push("이메일 주소를 포함한 비밀번호는 사용할 수 없습니다.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // 새 비밀번호 입력 시 유효성 검사
  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [newPassword, userEmail]);

  // 비밀번호 변경 처리
  const handlePasswordChange = async () => {
    // 입력값 검증
    if (!currentPassword.trim()) {
      setMessage("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      setMessage("새 비밀번호를 입력해주세요.");
      return;
    }

    if (!confirmPassword.trim()) {
      setMessage("새 비밀번호 확인을 입력해주세요.");
      return;
    }

    // 새 비밀번호 유효성 검사
    if (!passwordValidation.isValid) {
      setMessage("비밀번호 조건을 확인해주세요.");
      return;
    }

    // 새 비밀번호 일치 확인
    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 현재 비밀번호와 새 비밀번호 동일 확인
    if (currentPassword === newPassword) {
      setMessage("현재 비밀번호와 새 비밀번호가 동일합니다. 다른 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const token = TokenManager.getAccessToken();

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      console.log("=== 비밀번호 변경 API 요청 ===");
      console.log("요청 URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/user/password`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prevPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      console.log("API 응답 상태:", response.status);

      if (!response.ok) {
        let errorData: string;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorJson = await response.json();
          errorData = JSON.stringify(errorJson, null, 2);
          console.error("서버 에러 (JSON):", errorJson);

          // 서버에서 온 구체적인 에러 메시지 사용
          if (errorJson.message) {
            setMessage(errorJson.message);
          } else if (response.status === 400) {
            setMessage("현재 비밀번호가 올바르지 않습니다.");
          } else {
            setMessage("비밀번호 변경에 실패했습니다.");
          }
        } else {
          errorData = await response.text();
          console.error("서버 에러 (Text):", errorData);
          setMessage("비밀번호 변경에 실패했습니다.");
        }

        return;
      }

      // 성공 처리
      const result = await response.json();
      console.log("비밀번호 변경 성공:", result);

      setMessage("비밀번호가 성공적으로 변경되었습니다.");

      // 1.5초 후 모달 닫기
      setTimeout(() => {
        setModal();
      }, 1500);
    } catch (error) {
      console.error("=== 비밀번호 변경 실패 ===");
      console.error("에러 객체:", error);

      let errorMessage = "비밀번호 변경 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        } else {
          errorMessage = error.message;
        }
      }

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="모달 외부" onClick={setModal} className={styles.modalBackground}>
      <div id="모달" onClick={preventOffModal} className={styles.modal}>
        <p className={styles.close} onClick={setModal}>
          X
        </p>
        <div className={styles.password_box}>
          <p className={styles.title}>{title || "비밀번호 변경하기"}</p>

          <p className={styles.sentence}>현재 비밀번호</p>
          <input
            className={styles.input}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력하세요"
            disabled={isLoading}
          />

          <p className={styles.sentence}>새 비밀번호</p>
          <input
            className={styles.input}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
            disabled={isLoading}
          />

          {/* 비밀번호 조건 표시 */}
          {newPassword && (
            <div className={styles.password_requirements}>
              <p className={styles.requirements_title}>비밀번호 조건:</p>
              <ul className={styles.requirements_list}>
                <li className={newPassword.length >= 8 ? styles.valid : styles.invalid}>✓ 8자 이상</li>
                <li
                  className={
                    /[a-zA-Z]/.test(newPassword) &&
                    /\d/.test(newPassword) &&
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
                      ? styles.valid
                      : styles.invalid
                  }
                >
                  ✓ 영문자 + 숫자 + 특수문자 포함
                </li>
                <li className={!/(.)\1{2,}/.test(newPassword) ? styles.valid : styles.invalid}>
                  ✓ 동일한 문자 3자 이상 연속 사용 금지
                </li>
                <li
                  className={
                    !userEmail || !newPassword.toLowerCase().includes(userEmail.split("@")[0].toLowerCase())
                      ? styles.valid
                      : styles.invalid
                  }
                >
                  ✓ 이메일 주소 포함 금지
                </li>
              </ul>
            </div>
          )}

          <p className={styles.sentence}>새 비밀번호 확인</p>
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
            disabled={isLoading}
          />

          {/* 비밀번호 일치 확인 표시 */}
          {confirmPassword && (
            <p
              className={`${styles.match_indicator} ${
                newPassword === confirmPassword ? styles.match : styles.no_match
              }`}
            >
              {newPassword === confirmPassword ? "✓ 비밀번호가 일치합니다" : "✗ 비밀번호가 일치하지 않습니다"}
            </p>
          )}

          <p
            className={styles.button}
            onClick={!isLoading ? handlePasswordChange : undefined}
            style={{
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "변경 중..." : "비밀번호 변경"}
          </p>

          {/* 메시지 표시 */}
          {message && (
            <p
              className={styles.message}
              style={{
                color: message.includes("성공적으로") ? "green" : "red",
                marginTop: "10px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
