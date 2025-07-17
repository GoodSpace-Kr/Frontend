"use client";

import Link from "next/link";
import styles from "./body.module.css";

export default function FindEmail() {
  return (
    <div className={styles.findemail}>
      <p className={styles.title}>비밀번호 찾기</p>

      <div className={styles.email}>
        <input placeholder="이메일" className={styles.input_email} />
        <p className={styles.email_button}>이메일 인증</p>
      </div>
      <input placeholder="비밀번호 재설정" className={styles.input} />
      <input placeholder="비밀번호 확인" className={styles.input} />
      <div className={styles.button}>로그인하기</div>
    </div>
  );
}
