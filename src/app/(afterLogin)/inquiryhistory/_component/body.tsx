"use client";

import { useState, useEffect, JSX } from "react";
import Link from "next/link";
import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import History from "./history";
import { TokenManager } from "@/utils/tokenManager"; // ✅ 토큰 매니저 import

interface InquiryData {
  questionId: number;
  type: string;
  typeText: string;
  status: string;
  title: string;
  createdAt: string;
  content: string;
}

export default function Body(): JSX.Element {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<InquiryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 문의 유형 매핑
  const getTypeText = (value: string): string => {
    const types: Record<string, string> = {
      DELIVERY: "배송 문의",
      ORDER: "주문 문의",
      PRODUCT: "상품 문의",
    };
    return types[value] || "기타 문의";
  };

  // 서버에서 문의 내역 가져오기
  const fetchInquiries = async (): Promise<void> => {
    try {
      setIsLoading(true);

      let accessToken = TokenManager.getAccessToken();
      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) throw new Error("토큰이 없습니다. 다시 로그인해주세요.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/getUserQuestions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 토큰 만료 시 한 번 더 refresh 시도
      if (response.status === 401) {
        const newAccessToken = await TokenManager.refreshAccessToken();
        if (!newAccessToken) throw new Error("토큰 재발급 실패");

        const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/getUserQuestions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        if (!retryResponse.ok) throw new Error("문의 내역 불러오기 실패");
        const retryData: InquiryData[] = await retryResponse.json();

        const processedRetry = retryData.map((inquiry) => ({
          ...inquiry,
          typeText: getTypeText(inquiry.type),
        }));

        setInquiries(processedRetry);
        setFilteredInquiries(processedRetry);
        return;
      }

      if (!response.ok) throw new Error("문의 내역 불러오기 실패");

      const data: InquiryData[] = await response.json();

      const processedData = data.map((inquiry) => ({
        ...inquiry,
        typeText: getTypeText(inquiry.type),
      }));

      setInquiries(processedData);
      setFilteredInquiries(processedData);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 문의 삭제
  const handleDelete = async (id: number) => {
    setInquiries((prev) => prev.filter((inq) => inq.questionId !== id));
    setFilteredInquiries((prev) => prev.filter((inq) => inq.questionId !== id)); // ✅ 추가
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className={styles.body}>
      <div className={styles.main}>
        <div className={styles.back_button}>
          <IoArrowBackSharp className={styles.button_icon} />
          <Link href="/servicecenter" className={styles.button_text}>
            돌아가기
          </Link>
        </div>

        <p className={styles.title}>문의 내역</p>

        <div className={styles.historys}>
          {isLoading ? (
            <p>로딩 중...</p>
          ) : filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <History key={inquiry.questionId} inquiry={inquiry} onDelete={handleDelete} />
            ))
          ) : (
            <p>문의 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
