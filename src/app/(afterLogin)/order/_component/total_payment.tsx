"use client";

import styles from "./total_payment.module.css";

type InputProps = {
  title: string;
  value: string | number; // 값을 받을 수 있는 prop 추가
};

export default function TotalPayment({ title, value }: InputProps) {
  return (
    <div className={styles.total_payment_info}>
      <p className={styles.form_name}>{title}</p>
      <p className={styles.info_result}>{value}</p>
    </div>
  );
}
