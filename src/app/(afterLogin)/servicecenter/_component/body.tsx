"use client";

import styles from "./body.module.css";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import Help from "./help";
import Inquiry from "./inquiry";
import { useState, useEffect } from "react";
import { TokenManager } from "@/utils/tokenManager";

const helps = [
  { title: "언제 배송되는지 확인하고 싶어요.", description: "질문에 대한 상세 설명" },
  { title: "주문을 환불하고 싶어요.", description: "질문에 대한 상세 설명" },
  { title: "배송지를 수정하고 싶어요.", description: "질문에 대한 상세 설명" },
  { title: "결제 도중 문제가 발생했어요.", description: "질문에 대한 상세 설명" },
  { title: "소셜 계정과 연동하고 싶어요.", description: "질문에 대한 상세 설명" },
];

interface InquiryData {
  questionId: number;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Body() {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        // 액세스 토큰 확인
        let accessToken = TokenManager.getAccessToken();

        if (!accessToken) {
          console.log("액세스 토큰이 없습니다. 로그인이 필요합니다.");
          setError("로그인이 필요합니다.");
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/getUserQuestions`;

        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);

        if (response.status === 401) {
          // 토큰이 만료된 경우 재발급 후 재시도
          console.log("토큰 만료, 재발급 시도");
          accessToken = await TokenManager.refreshAccessToken();

          if (!accessToken) {
            throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
          }

          // 토큰 재발급 후 재시도
          const retryResponse = await fetch(apiUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            console.error("Retry error response:", errorText);
            throw new Error(`API 호출 실패: ${retryResponse.status} - ${errorText}`);
          }

          const data = await retryResponse.json();
          console.log("API Response (after retry):", data);
          setInquiries(Array.isArray(data) ? data : []);
        } else if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
        } else {
          const data = await response.json();
          console.log("API Response:", data);
          setInquiries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "답변 대기";
      case "COMPLETED":
        return "답변 완료";
      case "DELIVERY":
        return "배송 중";
      default:
        return status;
    }
  };

  return (
    <>
      <div className={styles.body}>
        <p className={styles.title}>안녕하세요, 무엇을 도와드릴까요?</p>
        <div className={styles.search}>
          <IoIosSearch className={styles.search_icon} />
          <input placeholder="무엇이든 물어보세요" className={styles.search_input}></input>
        </div>
        <div className={styles.main}>
          <div className={styles.help}>
            <p className={styles.help_title}>자주 찾는 도움말</p>
            <div className={styles.help_boxs}>
              {helps.map((help) => (
                <Help key={help.title} title={help.title} description={help.description} />
              ))}
            </div>
          </div>
          <div className={styles.inquiry}>
            <div className={styles.inquiry_header}>
              <p className={styles.inquiry_title}>문의 내용</p>
              <Link href="/inquiry" className={styles.inquiry_button}>
                문의하기
              </Link>
            </div>
            <div className={styles.inquiry_boxs}>
              {loading ? (
                <p>문의 내역을 불러오는 중...</p>
              ) : error ? (
                <p>오류: {error}</p>
              ) : inquiries.length === 0 ? (
                <p>문의 내역이 없습니다.</p>
              ) : (
                inquiries.map((inquiry) => (
                  <Inquiry key={inquiry.questionId} title={inquiry.title} result={getStatusText(inquiry.status)} />
                ))
              )}
            </div>
            <Link href="/inquiryhistory" className={styles.entire_inquiry}>
              전체 문의 보기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
