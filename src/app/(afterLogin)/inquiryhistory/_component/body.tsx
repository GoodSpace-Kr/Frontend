"use client";

import { useState, useEffect, ChangeEvent, JSX } from "react";
import Link from "next/link";
import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import History from "./history";

interface InquiryData {
  id: number;
  type: string;
  typeText: string;
  status: string;
  title: string;
  date: string;
  content?: string;
}

export default function Body(): JSX.Element {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<InquiryData[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 문의 유형 맵핑
  const getTypeText = (value: string): string => {
    const types: Record<string, string> = {
      "2": "상품 관련 문의",
      "3": "배송 관련 문의",
      "4": "교환/반품 관련 문의",
      "5": "결제/환불 관련 문의",
      "6": "기타 문의",
    };
    return types[value] || "";
  };

  // 서버에서 문의 내역 가져오기
  const fetchInquiries = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/inquiries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: InquiryData[] = await response.json();
        // 서버에서 받은 데이터에 typeText 추가
        const processedData = data.map((inquiry) => ({
          ...inquiry,
          typeText: getTypeText(inquiry.type),
        }));
        setInquiries(processedData);
        setFilteredInquiries(processedData);
      } else {
        console.error("문의 내역을 불러오는데 실패했습니다.");
        // 임시 더미 데이터 (서버 연결 전 테스트용)
        const dummyData: InquiryData[] = [
          {
            id: 1,
            type: "2",
            typeText: "상품 관련 문의",
            status: "답변 완료",
            title: "상품 배송 문의드립니다",
            date: "2024-01-15",
            content: "주문한 상품이 언제 배송되나요?",
          },
          {
            id: 2,
            type: "4",
            typeText: "교환/반품 관련 문의",
            status: "답변 대기",
            title: "상품 교환 요청",
            date: "2024-01-14",
            content: "받은 상품에 문제가 있어 교환하고 싶습니다.",
          },
        ];
        setInquiries(dummyData);
        setFilteredInquiries(dummyData);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      // 임시 더미 데이터
      const dummyData: InquiryData[] = [
        {
          id: 1,
          type: "2",
          typeText: "상품 관련 문의",
          status: "답변 완료",
          title: "상품 배송 문의드립니다",
          date: "2024-01-15",
          content: "주문한 상품이 언제 배송되나요?",
        },
        {
          id: 2,
          type: "4",
          typeText: "교환/반품 관련 문의",
          status: "답변 대기",
          title: "상품 교환 요청",
          date: "2024-01-14",
          content: "받은 상품에 문제가 있어 교환하고 싶습니다.",
        },
      ];
      setInquiries(dummyData);
      setFilteredInquiries(dummyData);
    } finally {
      setIsLoading(false);
    }
  };

  // 문의 삭제 함수
  const handleDeleteInquiry = async (id: number): Promise<void> => {
    if (!confirm("정말로 이 문의를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 로컬 상태에서 해당 문의 제거
        const updatedInquiries = inquiries.filter((inquiry) => inquiry.id !== id);
        setInquiries(updatedInquiries);

        // 필터링된 목록도 업데이트
        const updatedFiltered = filteredInquiries.filter((inquiry) => inquiry.id !== id);
        setFilteredInquiries(updatedFiltered);

        alert("문의가 삭제되었습니다.");
      } else {
        throw new Error("삭제 실패");
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      // 서버 연결 전에는 로컬에서만 삭제
      const updatedInquiries = inquiries.filter((inquiry) => inquiry.id !== id);
      setInquiries(updatedInquiries);

      const updatedFiltered = filteredInquiries.filter((inquiry) => inquiry.id !== id);
      setFilteredInquiries(updatedFiltered);

      alert("문의가 삭제되었습니다.");
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <>
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
                <History key={inquiry.id} inquiry={inquiry} onDelete={handleDeleteInquiry} />
              ))
            ) : (
              <p>문의 내역이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
