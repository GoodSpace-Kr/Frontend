// OrderSummary.tsx - 주문 요약
"use client";

import Link from "next/link";
import styles from "../_component/order.module.css";
import SummaryItem from "./summaryItem";

interface OrderResult {
  orderId: number;
  name: string;
  phone: string;
  email: string;
  receiver: string;
  phone1: string;
  phone2: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  orderCount: number;
  productAmount: number;
  shippingFee: number;
  totalAmount: number;
  items: Array<{
    id: number;
    itemId?: number;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    shortDescription?: string;
    titleImageUrl?: string;
  }>;
  orderType: string;
  orderDate: string;
}

interface OrderSummaryProps {
  orderResult: OrderResult;
}

export default function OrderSummary({ orderResult }: OrderSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  return (
    <>
      <div className={styles.ordersummary}>
        <p className={styles.summation}>주문 요약</p>

        {/* 주문 정보 */}
        <div className={styles.order_info_section}>
          <div className={styles.info_item}>
            <span>주문 일시</span>
            <span>{formatDate(orderResult.orderDate)}</span>
          </div>
          <div className={styles.info_item}>
            <span>수령인</span>
            <span>{orderResult.receiver}</span>
          </div>
          <div className={styles.info_item}>
            <span>연락처</span>
            <span>{formatPhoneNumber(orderResult.phone1)}</span>
          </div>
          <div className={styles.info_item}>
            <span>배송지</span>
            <span>
              ({orderResult.zipcode}) {orderResult.address} {orderResult.detailAddress}
            </span>
          </div>
        </div>

        {/* 주문 상품 목록 */}
        <div className={styles.items}>
          {orderResult.items.map((item, index) => (
            <SummaryItem key={item.id || index} item={item} />
          ))}
        </div>

        <div className={styles.line}></div>

        <div className={styles.items_result}>
          <p className={styles.items_result_a}>상품 금액</p>
          <p className={styles.items_result_b}>{orderResult.productAmount.toLocaleString()}원</p>
        </div>

        <div className={styles.items_result}>
          <p className={styles.items_result_a}>배송비</p>
          <p className={styles.items_result_b}>
            {orderResult.shippingFee === 0 ? "무료" : `${orderResult.shippingFee.toLocaleString()}원`}
          </p>
        </div>

        <div className={styles.line}></div>

        <div className={styles.total_price}>
          <p className={styles.total_price_a}>총 결제 금액</p>
          <p className={styles.total_price_a}>{orderResult.totalAmount.toLocaleString()}원</p>
        </div>

        <Link href="/mypage" className={styles.back_button}>
          주문 내역 확인하기
        </Link>

        <div className={styles.memo}>
          <p className={styles.memo_title}>배송 안내</p>
          <p className={styles.memo_sub}>50,000원 이상 구매 시 무료 배송</p>
          <p className={styles.memo_sub}>평일 오후 2시 이전 주문 시 당일 발송</p>
          <p className={styles.memo_sub}>제주도 및 도서산간 지역 추가 배송비 발생</p>
        </div>
      </div>
    </>
  );
}
