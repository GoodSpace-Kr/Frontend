"use client";

import styles from "./input_a.module.css";

type InputProps = {
  title: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
};

export default function InputA({ title, value, onChange, placeholder, readOnly }: InputProps) {
  return (
    <div className={styles.input_form}>
      <p className={styles.form_name}>{title}</p>
      <input
        className={styles.form_input}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
