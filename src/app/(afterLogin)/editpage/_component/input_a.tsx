"use client";

import styles from "./input_a.module.css";

type EditBoxProps = {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputA({ title, value, onChange }: EditBoxProps) {
  return (
    <div className={styles.form_box}>
      <p className={styles.form_title}>{title}</p>
      <input className={styles.input_a} value={value ?? ""} onChange={onChange} />
    </div>
  );
}
