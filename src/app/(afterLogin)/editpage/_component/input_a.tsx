"use client";

import styles from "./input_a.module.css";

type EditBoxProps = {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void; // onClick prop 추가 (선택적)
};

export default function InputA({ title, value, onChange, onClick }: EditBoxProps) {
  return (
    <div className={styles.form_box}>
      <p className={styles.form_title}>{title}</p>
      <input
        className={styles.input_a}
        value={value ?? ""}
        onChange={onChange}
        onClick={onClick} // input에 onClick 이벤트 추가
      />
    </div>
  );
}
