"use client";

import styles from "./inquiry.module.css";

type InquiryProps = {
  title: string;
  result: string;
};

export default function Inquiry({ title, result }: InquiryProps) {
  return (
    <div className={styles.inquiry_box}>
      <p className={styles.inquiry_box_title}>{title}</p>
      <p className={styles.inquiry_box_result}>{result}</p>
    </div>
  );
}
