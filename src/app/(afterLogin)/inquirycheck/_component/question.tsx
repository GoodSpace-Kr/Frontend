"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "./file";
import styles from "./question.module.css";
import { TokenManager } from "@/utils/tokenManager";
import Answer from "./answer";

interface AnswerData {
  content: string;
  createdAt: string;
}

interface FileData {
  data: string;
  extension: string | null;
  mimeType: string;
  name: string;
}

interface QuestionData {
  title: string;
  content: string;
  userId: number;
  type: string;
  status: string;
  createdAt: string;
  answerDto: AnswerData | null;
  questionFileDtos: FileData[];
}

export default function Question() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("id") ? parseInt(searchParams.get("id")!) : null;

  const [modalStatus, setModalStatus] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 문의 데이터 API 호출
  const fetchQuestionData = async (id: number) => {
    try {
      setLoading(true);
      let accessToken = TokenManager.getAccessToken();

      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) throw new Error("인증 토큰을 가져올 수 없습니다.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/getQuestion/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`API 호출 실패: ${response.status}`);

      const data = await response.json();
      setQuestionData(data);
    } catch (err) {
      console.error("문의 데이터 로딩 실패:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchQuestionData(questionId);
    }
  }, [questionId]);

  const onHandleModalStatus = () => setModalStatus(!modalStatus);

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case "DELIVERY":
        return "배송 관련 문의";
      case "PRODUCT":
        return "상품 관련 문의";
      case "ORDER":
        return "주문 관련 문의";
      case "REFUND":
        return "환불 관련 문의";
      default:
        return "기타 문의";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "답변 대기";
      case "COMPLETED":
        return "답변 완료";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.question}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.question}>
        <p className={styles.error}>오류: {error}</p>
        <button onClick={() => questionId && fetchQuestionData(questionId)}>다시 시도</button>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className={styles.question}>
        <p>문의 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const hasFiles = questionData.questionFileDtos?.length > 0;

  return (
    <>
      <div className={styles.question}>
        <p className={styles.inquiry_title}>문의내용</p>

        {/* 문의 타입/상태 */}
        <div className={styles.question_header_a}>
          <p className={styles.question_header_a_left}>{getQuestionTypeText(questionData.type)}</p>

          <p
            className={`${styles.question_header_a_right} ${
              questionData.status === "COMPLETED" ? styles.status_completed : styles.status_waiting
            }`}
          >
            {getStatusText(questionData.status)}
          </p>
        </div>

        {/* 제목 / 작성일 */}
        <div className={styles.question_header_b}>
          <p className={styles.question_title}>{questionData.title}</p>
          <p className={styles.question_date}>{formatDate(questionData.createdAt)}</p>
        </div>

        {/* 본문 */}
        <p className={styles.question_body}>{questionData.content}</p>

        {/* 첨부파일 UI */}
        {hasFiles ? (
          <p className={styles.question_file} onClick={onHandleModalStatus}>
            첨부파일 보기
          </p>
        ) : (
          <p className={styles.question_file_none}>첨부파일 없음</p>
        )}

        {/* 답변 */}
        {questionData.answerDto ? (
          <Answer content={questionData.answerDto.content} createdAt={formatDate(questionData.answerDto.createdAt)} />
        ) : (
          <div className={styles.answer}>
            <p className={styles.answer_header_title}>답변</p>
            <p className={styles.answer_body}>답변이 아직 작성되지 않았습니다.</p>
          </div>
        )}
        {modalStatus && (
          <Modal
            title="첨부파일 보기"
            setModal={onHandleModalStatus}
            fileData={questionData.questionFileDtos || []} // ✅ 안전 처리
          />
        )}
      </div>
    </>
  );
}
