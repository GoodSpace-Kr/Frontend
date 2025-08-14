import styles from "./result.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useState, useEffect } from "react";

type PurchaseItem = {
  date: string | null;
  id: number | null;
  itemInfo: string | null;
  totalQuantity: number | null;
  amount: number | null;
  status: string | null;
};

type ResultProps = {
  purchaseHistory: PurchaseItem[] | null;
  loading: boolean;
  statusMapping: { [key: string]: string } | null;
};

export default function Result({ purchaseHistory, loading, statusMapping }: ResultProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 표시할 아이템 수

  // null 방어: purchaseHistory가 null이면 빈 배열로 처리
  const safeHistory = purchaseHistory || [];

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(safeHistory.length / itemsPerPage);

  // 현재 페이지에 표시할 아이템들
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return safeHistory.slice(startIndex, endIndex);
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

  // 날짜 포맷팅 함수 - null 방어 추가
  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return "정보 없음";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "정보 없음";
      }
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
        2,
        "0"
      )}`;
    } catch (error) {
      return "정보 없음";
    }
  };

  // 금액 포맷팅 함수 - null 방어 추가
  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "정보 없음";
    }
    return amount.toLocaleString() + "원";
  };

  // 주문번호 포맷팅 함수
  const formatOrderId = (id: number | null) => {
    if (id === null || id === undefined) {
      return "#정보없음";
    }
    return `#${id}`;
  };

  // 수량 포맷팅 함수
  const formatQuantity = (quantity: number | null) => {
    if (quantity === null || quantity === undefined || isNaN(quantity)) {
      return "정보 없음";
    }
    return `${quantity}개`;
  };

  // 상품정보 포맷팅 함수
  const formatItemInfo = (itemInfo: string | null) => {
    if (!itemInfo || itemInfo.trim() === "") {
      return "정보 없음";
    }
    return itemInfo;
  };

  // 상태 포맷팅 함수
  const formatStatus = (status: string | null) => {
    if (!status) {
      return "정보 없음";
    }
    const safeStatusMapping = statusMapping || {};
    return safeStatusMapping[status] || status;
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
          {safeHistory.length === 0 ? (
            <div className={styles.empty_message}>구매내역이 없습니다.</div>
          ) : (
            getCurrentPageItems().map((item, index) => (
              <div key={`${item?.id || "unknown"}-${item?.date || "unknown"}-${index}`} className={styles.result_item}>
                <div className={styles.date_order}>
                  <p className={styles.date}>{formatDate(item?.date)}</p>
                  <p className={styles.order_id}>{formatOrderId(item?.id)}</p>
                </div>
                <p className={styles.item_info}>{formatItemInfo(item?.itemInfo)}</p>
                <p className={styles.quantity}>{formatQuantity(item?.totalQuantity)}</p>
                <p className={styles.amount}>{formatAmount(item?.amount)}</p>
                <p className={styles.status}>{formatStatus(item?.status)}</p>
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
