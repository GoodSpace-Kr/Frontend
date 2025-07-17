"use client";

import { useState } from "react";
import styles from "./body.module.css";

export default function FindEmail() {
  const [showResult, setShowResult] = useState(false);

  const handleSearch = () => {
    setShowResult(true);
  };

  return (
    <div className={styles.findemail}>
      <p className={styles.title}>이메일(아이디) 찾기</p>

      <input placeholder="이메일" className={styles.input} />
      <input placeholder="비밀번호" className={styles.input} />

      <div className={styles.button} onClick={handleSearch}>
        조회하기
      </div>

      {showResult && (
        <div className={styles.result}>
          <p className={styles.message}>현재 이메일은 :</p>
          <p className={styles.message}>[example11@naver.com] 입니다.</p>
        </div>
      )}
    </div>
  );
}
