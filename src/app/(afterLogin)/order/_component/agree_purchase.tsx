"use client";

import { useState } from "react";
import styles from "./agree_purchase.module.css";

interface AgreePurchaseProps {
  onToggle?: (isAgreed: boolean) => void; // 부모 컴포넌트에서 상태를 받고 싶을 때 사용
}

export default function AgreePurchase({ onToggle }: AgreePurchaseProps) {
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
      <div className={styles.agree_purchase}>
        <div className={styles.agree_purchase_header}>
          <p
            className={`${styles.button} ${isAgreed ? styles.button_checked : styles.button_unchecked}`}
            onClick={handleToggle}
          ></p>
          <p>주문 상품 구매 동의(필수)</p>
        </div>
        <div className={styles.agree_purchase_body}>
          <p className={styles.message}>상품 주문시 완성된 상품과 일부 다를 수 있습니다.</p>
          <p className={styles.message}>
            구매 후 취소 및 환불은 입금 상태 확인 전 가능하며, 배송 완료 후 단순 변심에 의한 교환/반품은 불가합니다.
          </p>
          <p className={styles.message}>결제 전 주문내용을 반드시 확인해 주시기 바랍니다.</p>
          <p className={styles.message}>주문할 상품, 배송 정보를 확인하였으며, 구매에 동의하시겠습니까?</p>
        </div>
      </div>
    </>
  );
}
