"use client";

import { useState, useEffect } from "react";
import styles from "./email.module.css";

interface ModalProps {
  title?: string;
  setModal: () => void;
  onEmailChange?: (newEmail: string) => void; // 이메일 변경 콜백
}

const Modal = ({ title, setModal, onEmailChange }: ModalProps) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCitation, setShowCitation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [message, setMessage] = useState("");

  // 모달이 뜬 상태에서는 뒷 화면 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 이메일 전송
  const sendVerificationCode = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setMessage("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/email/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setShowCitation(true);
        setMessage("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "이메일 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      setMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (response.ok) {
        setIsEmailVerified(true);
        setMessage("이메일 인증이 완료되었습니다.");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error(error);
      setMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 변경하기 (인증 완료 후)
  const handleEmailChange = async () => {
    if (!isEmailVerified) {
      setMessage("먼저 이메일 인증을 완료해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("이메일 변경 중...");

    try {
      // ✅ 실제 이메일 변경 API 연결
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/email`, {
        method: "PATCH", // 서버에서 요구하는 메서드 확인 필요
        headers: {
          "Content-Type": "application/json",
          // 필요 시 토큰 추가
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`이메일 변경 실패: ${errorText}`);
      }

      // 부모 컴포넌트에 새 이메일 전달
      if (onEmailChange) {
        onEmailChange(email);
      }

      setMessage("이메일이 성공적으로 변경되었습니다.");

      setTimeout(() => {
        setModal(); // 모달 닫기
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("이메일 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫힘 방지
  const preventOffModal = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  // 메인 버튼 클릭 핸들러
  const handleMainButtonClick = () => {
    if (isEmailVerified) {
      handleEmailChange();
    } else {
      sendVerificationCode();
    }
  };

  return (
    <div id="모달 외부" onClick={setModal} className={styles.modalBackground}>
      <div id="모달" onClick={preventOffModal} className={styles.modal}>
        <p
          className={styles.close}
          onClick={(e) => {
            e.stopPropagation();
            setModal();
          }}
        >
          X
        </p>

        <div className={styles.email_box}>
          <p className={styles.title}>{title || "이메일 변경하기"}</p>

          <p className={styles.sentence}>새 이메일</p>
          <input
            className={styles.input}
            type="email"
            placeholder="새 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isEmailVerified}
          />

          {/* 인증번호 입력창 */}
          {showCitation && (
            <div className={styles.citation}>
              <input
                className={styles.number}
                placeholder="인증번호 입력"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading || isEmailVerified}
              />
              <p
                className={styles.check_button}
                onClick={!isEmailVerified && !isLoading ? verifyCode : undefined}
                style={{
                  opacity: isEmailVerified ? 0.5 : isLoading ? 0.5 : 1,
                  cursor: isEmailVerified || isLoading ? "not-allowed" : "pointer",
                  backgroundColor: isEmailVerified ? "#28a745" : "",
                  color: isEmailVerified ? "white" : "",
                }}
              >
                {isEmailVerified ? "확인됨" : isLoading ? "확인중..." : "확인"}
              </p>
            </div>
          )}

          {/* 이메일 인증 / 변경 버튼 */}
          <p
            className={styles.button}
            onClick={!isLoading ? handleMainButtonClick : undefined}
            style={{
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isEmailVerified ? "이메일 변경하기" : isLoading ? "확인 중..." : "이메일 인증"}
          </p>

          {message && (
            <p
              className={styles.message}
              style={{
                color:
                  message.includes("완료") || message.includes("발송") || message.includes("변경되었습니다")
                    ? "green"
                    : "red",
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
