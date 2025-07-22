"use client";

import styles from "./input_b.module.css";

export default function InputB() {
  return (
    <>
      <div className={styles.form_pw}>
        <div className={styles.form_pw_box}>
          <p className={styles.form_title}>비밀번호</p>
          <input className={styles.input_a} />
        </div>
        <div className={styles.find_pw_button}>비밀번호 변경하기</div>
      </div>
    </>
  );
}
