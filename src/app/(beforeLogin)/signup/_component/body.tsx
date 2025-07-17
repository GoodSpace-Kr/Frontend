"use client";

import { useState } from "react";
import styles from "./body.module.css";
import LoginIcons from "../../_component/loginicon";

export default function Body() {
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleEmailCheck = () => {
    // 여기서 실제 이메일 인증 로직을 수행하거나…
    setShowCodeInput(true);
  };

  return (
    <div className={styles.body}>
      <p className={styles.title}>회원가입</p>

      <div className={styles.email}>
        <input placeholder="이메일" className={styles.email_input} />
        <div className={styles.email_check} onClick={handleEmailCheck}>
          이메일 인증
        </div>
      </div>

      {showCodeInput && (
        <div className={styles.email}>
          <input placeholder="이메일 인증 번호" className={styles.email_input} />
          <div className={styles.email_check}>인증 확인</div>
        </div>
      )}

      <input placeholder="비밀번호" className={styles.pw_input} />
      <p className={styles.message}>8~16자의 영문 대소문자, 숫자, 특수문자만 가능합니다.</p>
      <input placeholder="비밀번호 확인" className={styles.check_input} />

      <div className={styles.signup_button}>가입하기</div>
      <div className={styles.back_button}>돌아가기</div>

      <LoginIcons />
    </div>
  );
}
