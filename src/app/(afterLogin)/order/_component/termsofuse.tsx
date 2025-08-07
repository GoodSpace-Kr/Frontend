"use client";

import { useState } from "react";
import styles from "./termsofuse.module.css";

interface TermsOfUseProps {
  onToggle?: (isAgreed: boolean) => void; // 부모 컴포넌트에서 상태를 받고 싶을 때 사용
}

export default function TermsOfUse({ onToggle }: TermsOfUseProps) {
  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const handleToggle = (): void => {
    const newValue = !isAgreed;
    setIsAgreed(newValue);

    // 부모 컴포넌트에 상태 변경 알림
    if (onToggle) {
      onToggle(newValue);
    }
  };
  return (
    <>
      <div className={styles.terms_of_use}>
        <p
          className={`${styles.button} ${isAgreed ? styles.button_checked : styles.button_unchecked}`}
          onClick={handleToggle}
        ></p>
        <p className={styles.sentence}>이용약관 동의(필수)</p>
        <p className={styles.show}>보기</p>
      </div>
    </>
  );
}
