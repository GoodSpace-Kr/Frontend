"use client";
import React from "react";
import styles from "./answer.module.css";

interface AnswerProps {
  content: string;
  createdAt: string;
}

export default function Answer({ content, createdAt }: AnswerProps) {
  return (
    <div className={styles.answer}>
      <div className={styles.answer_header}>
        <p className={styles.answer_header_title}>답변</p>
        <p className={styles.answer_header_date}>{createdAt}</p>
      </div>
      <p className={styles.answer_body}>{content}</p>
    </div>
  );
}
