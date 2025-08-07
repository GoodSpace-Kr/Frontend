"use client";

import { useState } from "react";
import styles from "./personal.module.css";

interface PersonalInfoProps {
  onToggle?: (isAgreed: boolean) => void; // 부모 컴포넌트에서 상태를 받고 싶을 때 사용
}

export default function PersonalInfo({ onToggle }: PersonalInfoProps) {
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
      <div className={styles.personal_info}>
        <p
          className={`${styles.button} ${isAgreed ? styles.button_checked : styles.button_unchecked}`}
          onClick={handleToggle}
        ></p>
        <p className={styles.sentence}>개인정보 수집 및 이용 동의(필수)</p>
        <p className={styles.show}>보기</p>
      </div>
    </>
  );
}
