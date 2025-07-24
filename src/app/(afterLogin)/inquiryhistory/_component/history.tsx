"use client";

import { JSX, useState } from "react";
import styles from "./history.module.css";
import Link from "next/link";

interface InquiryData {
  id: number;
  type: string;
  typeText: string;
  status: string;
  title: string;
  date: string;
  content?: string;
}

interface HistoryProps {
  inquiry: InquiryData;
  onDelete: (id: number) => Promise<void>;
}

export default function History({ inquiry, onDelete }: HistoryProps): JSX.Element {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    if (!confirm("정말로 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(inquiry.id);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      <div className={styles.history}>
        <div className={styles.history_header}>
          <div className={styles.history_header_text}>
            <p className={styles.history_header_text_a}>{inquiry.typeText}</p>
            <p
              className={`${styles.history_header_text_b} ${
                inquiry.status === "답변 대기"
                  ? styles.status_pending
                  : inquiry.status === "답변 완료"
                  ? styles.status_completed
                  : ""
              }`}
            >
              {inquiry.status}
            </p>
          </div>
          <div className={styles.history_header_button}>
            <Link href={`/inquiryedit?id=${inquiry.id}`} className={styles.history_header_button_edit}>
              수정
            </Link>
            <p
              className={styles.history_header_button_delete}
              onClick={handleDelete}
              style={{
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.6 : 1,
                pointerEvents: isDeleting ? "none" : "auto",
              }}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </p>
          </div>
        </div>

        <div className={styles.history_body}>
          <Link href={`/inquirycheck?id=${inquiry.id}`} className={styles.history_body_title}>
            {inquiry.title}
          </Link>
          <p className={styles.history_body_date}>{formatDate(inquiry.date)}</p>
        </div>
      </div>
    </>
  );
}
