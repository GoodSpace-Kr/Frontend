"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./body.module.css";

export default function FindEmail() {
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleEmailCheck = () => {
    // 여기서 실제 이메일 인증 로직을 수행하거나…
    setShowCodeInput(true);
  };

  return (
    <div className={styles.findemail}>
      <p className={styles.title}>비밀번호 찾기</p>

      <div className={styles.email}>
        <input placeholder="이메일" className={styles.input_email} />
        <p className={styles.email_button} onClick={handleEmailCheck}>
          이메일 인증
        </p>
      </div>

      {showCodeInput && (
        <div className={styles.email}>
          <input placeholder="이메일 인증 번호" className={styles.email_input} />
          <div className={styles.email_check}>인증 확인</div>
        </div>
      )}

      <input placeholder="비밀번호 재설정" className={styles.input} />
      <input placeholder="비밀번호 확인" className={styles.input} />
      <Link href="/login" className={styles.button}>
        비밀번호 변경
      </Link>
    </div>
  );
}
