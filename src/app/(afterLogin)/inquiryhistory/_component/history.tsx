"use client";

import { JSX, useState } from "react";
import styles from "./history.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InquiryData {
  questionId: number;
  type: string;
  typeText: string;
  status: string;
  title: string;
  createdAt: string;
  content: string;
}

interface HistoryProps {
  inquiry: InquiryData;
  onDelete: (id: number) => Promise<void>;
}

export default function History({ inquiry, onDelete }: HistoryProps): JSX.Element {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const router = useRouter(); // router 선언 추가

  // 문의 상세 페이지로 이동하는 함수
  const handleInquiryClick = () => {
    router.push(`/inquirycheck?id=${inquiry.questionId}`);
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    setIsDeleting(true);

    try {
      const accessToken = localStorage.getItem("accessToken"); // TokenManager 사용 가능

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/delete/${inquiry.questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status}`);
      }

      // 부모 상태 업데이트 → 화면에서 바로 사라짐
      await onDelete(inquiry.questionId);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("삭제 중 오류가 발생했습니다.");
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

  // 상태를 한글로 변환
  const getStatusText = (status: string): string => {
    return status === "WAITING" ? "답변 대기" : "답변 완료";
  };

  return (
    <div className={styles.history}>
      <div className={styles.history_header}>
        <div className={styles.history_header_text}>
          <p className={styles.history_header_text_a}>{inquiry.typeText}</p>
          <p
            className={`${styles.history_header_text_b} ${
              inquiry.status === "WAITING" ? styles.status_pending : styles.status_completed
            }`}
          >
            {getStatusText(inquiry.status)}
          </p>
        </div>
        <div className={styles.history_header_button}>
          <Link href={`/inquiryedit?id=${inquiry.questionId}`} className={styles.history_header_button_edit}>
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
        {/* Link 대신 div로 변경하고 onClick 이벤트 추가 */}
        <div className={styles.history_body_title} onClick={handleInquiryClick} style={{ cursor: "pointer" }}>
          {inquiry.title}
        </div>
        <p className={styles.history_body_date}>{formatDate(inquiry.createdAt)}</p>
      </div>
    </div>
  );
}
