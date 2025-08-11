import styles from "./result.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useState, useEffect } from "react";

type PurchaseItem = {
  date: string;
  id: number;
  itemInfo: string;
  totalQuantity: number;
  amount: number;
  status: string;
};

type ResultProps = {
  purchaseHistory: PurchaseItem[];
  loading: boolean;
  statusMapping: { [key: string]: string };
};

export default function Result({ purchaseHistory, loading, statusMapping }: ResultProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 표시할 아이템 수

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(purchaseHistory.length / itemsPerPage);

  // 현재 페이지에 표시할 아이템들
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return purchaseHistory.slice(startIndex, endIndex);
  };

  // 페이지 변경 시 currentPage 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [purchaseHistory]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
      2,
      "0"
    )}`;
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + "원";
  };

  if (loading) {
    return (
      <div className={styles.result}>
        <div className={styles.result_title}>
          <p>주문일자/주문번호</p>
          <p>구매상품정보</p>
          <p>수량</p>
          <p>금액</p>
          <p>진행상태</p>
        </div>
        <div className={styles.result_body}>
          <div className={styles.loading_message}>로딩 중...</div>
        </div>
        <div className={styles.result_footer}>
          <MdKeyboardArrowLeft className={styles.icon} />
          <p>1</p>
          <MdKeyboardArrowRight className={styles.icon} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.result}>
        <div className={styles.result_title}>
          <p>주문일자/주문번호</p>
          <p>구매상품정보</p>
          <p>수량</p>
          <p>금액</p>
          <p>진행상태</p>
        </div>

        <div className={styles.result_body}>
          {purchaseHistory.length === 0 ? (
            <div className={styles.empty_message}>구매내역이 없습니다.</div>
          ) : (
            getCurrentPageItems().map((item) => (
              <div key={`${item.id}-${item.date}`} className={styles.result_item}>
                <div className={styles.date_order}>
                  <p className={styles.date}>{formatDate(item.date)}</p>
                  <p className={styles.order_id}>#{item.id}</p>
                </div>
                <p className={styles.item_info}>{item.itemInfo}</p>
                <p className={styles.quantity}>{item.totalQuantity}개</p>
                <p className={styles.amount}>{formatAmount(item.amount)}</p>
                <p className={styles.status}>{statusMapping[item.status] || item.status}</p>
              </div>
            ))
          )}
        </div>

        <div className={styles.result_footer}>
          <MdKeyboardArrowLeft
            className={`${styles.icon} ${currentPage === 1 ? styles.disabled : ""}`}
            onClick={handlePrevPage}
          />
          <p>{totalPages === 0 ? 1 : currentPage}</p>
          <MdKeyboardArrowRight
            className={`${styles.icon} ${currentPage === totalPages || totalPages === 0 ? styles.disabled : ""}`}
            onClick={handleNextPage}
          />
        </div>
      </div>
    </>
  );
}
